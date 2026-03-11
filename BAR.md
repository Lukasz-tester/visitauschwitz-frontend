# Account Usage in Status Line — Research & Implementation Notes

## Goal

Show account-level usage (the quota bar from `/usage`) persistently in the CLI status line, updating it every 5 minutes.

## Keychain Credentials

The OAuth token is stored in macOS keychain under `Claude Code-credentials`.

**Structure:**
```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt": "...",
    "rateLimitTier": "default_claude_ai",
    "subscriptionType": "pro",
    "scopes": [
      "user:inference",
      "user:mcp_servers",
      "user:profile",
      "user:sessions:claude_code"
    ]
  }
}
```

**Extract token:**
```bash
security find-generic-password -s "Claude Code-credentials" -w | jq -r '.claudeAiOauth.accessToken'
```

## API Endpoint Discovery

### From Binary Analysis (`strings` on Claude Code v2.1.73)

Found these relevant endpoints in the compiled binary:
- `/api/oauth/account/settings` — used by the `/usage` modal (function `vb`)
- `/api/oauth/usage` — separate usage endpoint
- `/api/oauth/account/grove_notice_viewed`
- `/api/claude_code_grove`
- `/api/bootstrap` — returns feature flags, account info

The binary code shows:
```js
wq.get(`${X6().BASE_API_URL}/api/oauth/account/settings`, {
  headers: { ...T.headers, "User-Agent": c3() }
})
```
Where `U3()` returns auth headers and `X6().BASE_API_URL` is the base URL.

## Endpoint Test Results

### `/api/oauth/usage` — WORKS (but rate limited)
```
URL: https://api.anthropic.com/api/oauth/usage
Auth: Bearer <accessToken>
Result: HTTP 429 — Rate limited (retry-after: 3565 seconds = ~1 hour)
```
This is the only endpoint that accepted the OAuth Bearer token without returning 401/403. The 429 means authentication succeeded but we hit the rate limit. **This is the correct endpoint.**

### `/api/oauth/account/settings` — 401
```
Result: HTTP 401 — "OAuth authentication is currently not supported."
```
Despite being used in the binary, this endpoint rejects a plain Bearer token. The CLI likely uses additional/different auth headers via its internal `U3()` function that we haven't been able to replicate.

### `/api/bootstrap` — 200 (partial)
```
Result: HTTP 200 — Returns { account: null, growthbook: {...}, statsig: {...}, ... }
```
Returns feature flags but `account` is null with OAuth token — likely needs session auth.

### Other endpoints tried — all failed:
| Endpoint | Status | Error |
|----------|--------|-------|
| `/api/organizations` | 403 | account_session_invalid |
| `/api/account` | 403 | account_session_invalid |
| `/v1/usage` | 404 | Not Found |
| `/api/billing/usage` | 404 | Not Found |
| `/api/claude_code/settings` | 401 | OAuth not supported |
| `/api/claude_code/usage` | 404 | Not Found |
| `/api/consumer/settings` | 404 | Not Found |
| `/api/me` | 404 | Not Found |
| `/api/settings` | 404 | Not Found |
| `/api/auth/session` | 404 | Not Found |
| `claude.ai/api/account/settings` | 403 | Cloudflare challenge |
| `claude.ai/api/organizations` | 403 | Cloudflare challenge |
| `claude.ai/api/auth/user_info` | 403 | Cloudflare challenge |
| `console.anthropic.com/api/oauth/account/settings` | 302 | Redirect |

## Current Implementation State

### Created: `~/.claude/fetch-usage.sh`
- Extracts OAuth token from keychain
- Calls `/api/oauth/usage` with Bearer auth
- Caches response to `~/.claude/usage-cache.json` with timestamp
- Made executable

### Modified: `~/.claude/status-line.sh`
- Reads `~/.claude/usage-cache.json` if it exists
- If cache is older than 5 min, triggers `fetch-usage.sh` in background (non-blocking)
- Parses usage fields with multiple fallback paths (since response schema is unknown)
- Displays colored bar: green (<70%), yellow (70-90%), red (>90%)
- Shows `$used/$limit` next to the bar
- Falls back gracefully if no cache or parse errors

### NOT yet known: Response schema for `/api/oauth/usage`
We were rate-limited before getting a successful response. The parsing in `status-line.sh` tries these field paths:
```
.usage.current_usage_usd // .usage.spend // .spend // .current_usage_usd
.usage.limit_usd // .usage.hard_limit_usd // .hard_limit_usd // .limit_usd
```
These will need adjustment once we see the actual response.

## Next Steps

1. **Wait for rate limit to clear** (~1 hour from last attempt at 21:29 UTC on 2026-03-11)
2. **Run `~/.claude/fetch-usage.sh`** — inspect `~/.claude/usage-cache.json` to see actual schema
3. **Adjust parsing** in `status-line.sh` based on real field names
4. **Test end-to-end** — verify status line displays the usage bar

## Risks & Considerations

- **Rate limiting is aggressive** — retry-after of ~1 hour. 5-minute cache refresh is too frequent; may need 30-60 min intervals
- **Undocumented API** — can break without notice on any CLI update
- **`/api/oauth/account/settings` auth mystery** — the CLI uses additional auth headers beyond simple Bearer. If `/api/oauth/usage` stops working, we'd need to reverse-engineer the `U3()` auth function
- **Keychain access** — `security find-generic-password` may trigger macOS permission prompts in some configurations
- **Token refresh** — the OAuth token has an `expiresAt` field; long-running sessions may need token refresh (the CLI handles this internally via `refreshToken`)

## Alternative Approaches

### Option A: Local stats only (no API needed)
`~/.claude/stats-cache.json` has local token counts but `costUSD` is always 0. Could show token counts but not the dollar quota the user wants.

### Option B: Wait for official support
GitHub issue: https://github.com/anthropics/claude-code/issues/13585
The status line JSON already includes `cost.total_cost_usd` for session cost. Anthropic could add account-level fields natively.

### Option C: Intercept CLI traffic
Use mitmproxy to capture what the `/usage` modal actually sends — would reveal exact headers and response schema. More complex setup but definitive.
