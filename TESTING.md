# TESTING.md — visitauschwitz-frontend QA Suite

**Purpose:** A complete automated testing strategy that catches regressions before deploy. Run `pnpm qa` to validate the entire app in one command.

**Resume protocol:** Each step in §8 is a self-contained checklist item. Work proceeds top-to-bottom, one step per commit (`test(qa): step N/M — <title>`). If interrupted, run `git log --oneline | grep "test(qa)"` and resume at the first unchecked `[ ]` box.

---

## 1. Project context

- **Stack:** Next.js 15 (App Router, static export via `next build` → `out/`), React 19, TypeScript, Tailwind, next-intl (en/pl), Leaflet maps.
- **CMS:** External Payload deployment. Frontend reads via REST through `src/utilities/cmsFetch.ts` (with `cms-data.json` cache + 2-concurrent throttle).
- **Build pipeline:** `generate:sitemap` → `generate:llms` → `generate:meta` → `next build`.
- **Cloudflare Functions:**
  - `functions/_middleware.js` — locale redirect (CF country header + Accept-Language → `/en/...` or `/pl/...`).
  - `functions/api/contact.js` — Resend email POST (honeypot `_hp_company`, email regex).
  - `functions/api/subscribe.js` — proxies to CMS `/api/subscribe`.
  - `functions/api/cms/[[path]].js` — generic CMS GET proxy.
- **Critical user journeys:**
  1. Locale-prefixed page renders (`/en/`, `/pl/`, `/{locale}/{slug}`).
  2. Posts: list, paginated list, detail.
  3. Header / Footer globals.
  4. Map page (Leaflet — heavy client).
  5. Search (under map).
  6. Newsletter subscribe + Contact submit (POST to CF Functions).
  7. Locale auto-redirect at root `/`.
- **NOT in scope:** the CMS repo (`../visitauschwitz-cms`), the legacy `Form` block (unused), admin auth.

## 2. Testing pyramid

```
       /\        Visual + Lighthouse (slow, few)
      /  \
     /----\      E2E + a11y (medium, focused on critical journeys)
    /      \
   /--------\    Component (RTL, fast, per-block)
  /          \
 /------------\  Unit + contract (fastest, broadest)
```

Bias: heavy on **visual regression** (you reported layout shifts) and on **Chrome / Safari, mobile + desktop** (matches user analytics).

## 3. Tooling

| Layer | Tool |
|---|---|
| Runner | Vitest |
| Component | Vitest + @testing-library/react + jsdom |
| E2E + Visual | Playwright (committed snapshots via `toHaveScreenshot`) |
| A11y | @axe-core/playwright (inside E2E) |
| Performance | Lighthouse CI (local, against `pnpm start`) |
| Contract / Mock | MSW (mocks `CMS_PUBLIC_SERVER_URL`) |
| Lint / Types | existing `pnpm lint` + `tsc --noEmit` |

## 4. Performance budgets

Mobile (throttled, 4× CPU): perf ≥ 90, LCP < 2.5 s, CLS < 0.10, TBT < 200 ms.
Desktop: perf ≥ 95, LCP < 2.0 s, CLS < 0.05.

## 5. Directory layout

```
tests/
├── unit/              # utility & helper tests
├── component/         # block & component tests (RTL)
├── contract/          # cmsFetch / getDocument / getGlobals (MSW)
├── functions/         # Cloudflare Functions tests
├── e2e/               # Playwright user journeys
├── visual/            # screenshot baselines (committed)
├── fixtures/          # sample CMS responses
├── helpers/           # render(), mockCms(), buildBlock()
└── setup/             # vitest.setup.ts, playwright globalSetup
lighthouserc.json
playwright.config.ts
vitest.config.ts
```

## 6. The one command

```bash
pnpm qa
```

Sequential, fail-fast: `lint` → `typecheck` → `test:unit` → `test:component` → `test:contract` → `test:functions` → `build` → `test:e2e` (incl. visual + a11y) → `test:lhci`.

Also: `pnpm qa:fast` skips build + lhci + visual for inner-loop speed.

## 7. Future-proofing rules

- **One fixture per CMS shape** in `tests/fixtures/`. New collection → new fixture.
- **`buildBlock(type, overrides)`** factory drives block tests — adding a block = one factory entry + one snapshot test.
- **E2E uses semantic selectors** (roles, labels, text) — no brittle CSS paths.
- **Visual baselines per Playwright project** (Chromium-Desktop, Chromium-Mobile, WebKit-Desktop, WebKit-Mobile). Refresh: `pnpm test:visual --update-snapshots`.
- **Contract test fails loudly** on CMS shape drift → forces fixture update consciously.

## 8. Implementation checklist (resume here)

Each step = one commit. Every step ends with a working `pnpm <something>` you can run.

- [x] **Step 0** — Land this `TESTING.md`.
- [x] **Step 1** — Vitest + RTL setup, `pnpm test:unit` green.
- [x] **Step 2** — Unit tests for utilities (46 tests).
- [x] **Step 3** — MSW + CMS fixtures and mock server.
- [x] **Step 4** — Contract tests for `cmsFetch` / `getDocument` / `getGlobals` / `getRedirects` (11 tests).
- [x] **Step 5** — Cloudflare Functions tests (23 tests).
- [x] **Step 6** — Block dispatcher and error boundary tests.
- [x] **Step 7** — `PageRange` and `ContactForm` component tests.
- [x] **Step 8** — Playwright config with 4 projects (Chrome/Safari × Desktop/Mobile).
- [x] **Step 9** — E2E smoke tests for critical page renders.
- [x] **Step 10** — E2E for map (Leaflet) and search pages.
- [x] **Step 11** — E2E forms with mocked network.
- [x] **Step 12** — Visual regression spec (baselines generated on first run).
- [x] **Step 13** — Axe-core a11y scans on key pages (chromium-desktop only).
- [x] **Step 14** — Lighthouse CI with perf and CWV budgets.
- [x] **Step 15** — Wire `pnpm qa` and `pnpm qa:fast`.
- [x] **Step 16** — This documentation pass.

## 9. How to run

### Daily inner-loop (fast, ~10 s)

```bash
pnpm qa:fast        # lint + typecheck + unit + component + contract + functions
pnpm test:watch     # vitest watch mode
```

### Full pre-commit / pre-deploy run

```bash
pnpm qa
```

This runs `qa:fast` then:
1. `pnpm build` — full Next.js static export (must pass before E2E can run).
2. `pnpm test:e2e` — Playwright across all 4 projects, including visual + a11y.
3. `pnpm test:lhci` — Lighthouse CI against `pnpm start`.

The full run takes a few minutes. `qa:fast` is what you want during active development.

### Individual layers

| Command | What |
|---|---|
| `pnpm test:unit` | Pure functions in `src/utilities/`. |
| `pnpm test:component` | React components with RTL + jsdom. |
| `pnpm test:contract` | `cmsFetch` and friends, against MSW mocks. |
| `pnpm test:functions` | Cloudflare Functions in `functions/`. |
| `pnpm test:e2e` | All Playwright specs (smoke, map, search, forms, visual, a11y). |
| `pnpm test:e2e:ui` | Playwright UI mode for debugging. |
| `pnpm test:visual` | Only specs tagged `@visual`. |
| `pnpm test:e2e:update` | Refresh **all** Playwright snapshots (visual baselines). |
| `pnpm test:lhci` | Lighthouse CI with the budgets in §4. |

### First-time E2E setup

1. `pnpm exec playwright install chromium webkit` (already run; re-run after Playwright upgrades).
2. `pnpm build && pnpm start` once — confirms the app actually serves before Playwright spins it up.
3. `pnpm test:e2e:update` — generates the initial visual baselines under `tests/visual/__snapshots__/`. Commit them. Subsequent runs diff against these.

### Updating visual baselines after intentional UI changes

```bash
pnpm test:e2e:update -- --grep @visual
git add tests/visual/__snapshots__
git commit -m "test(visual): refresh baselines for <change>"
```

Baselines are platform-specific (macOS pixels ≠ Linux pixels). Only refresh on the same OS you'll be running CI on.

## 10. How to extend

When you add a new piece of code, ask "what would catch a regression here?" and add tests at the lowest layer that can answer.

### Adding a new utility (`src/utilities/foo.ts`)

1. Create `tests/unit/foo.test.ts`.
2. Cover happy path + boundaries + the one weird input you almost forgot.
3. `pnpm test:unit` — verify.

### Adding a new content block (`src/blocks/Foo/Component.tsx`)

1. Add it to the dispatcher in `src/blocks/RenderBlocks.tsx`.
2. Add a stub for it in `tests/component/RenderBlocks.test.tsx` (one line in the `vi.mock` list) and a corresponding entry in the dispatch test.
3. If the block has non-trivial logic (form handling, conditional rendering), add a focused component test under `tests/component/`.
4. Visual coverage comes for free via `tests/e2e/visual.spec.ts` once the block lands on a page in `VISUAL_PAGES`.

### Adding a new page route

1. Add a smoke test entry in `tests/e2e/smoke.spec.ts` (or extend an existing block).
2. If the page should be visually frozen, add it to `VISUAL_PAGES` in `tests/e2e/visual.spec.ts` and run `pnpm test:e2e:update`.
3. If the page is performance-critical, add its URL to `lighthouserc.json`.

### Adding a new Cloudflare Function

1. Create `tests/functions/<name>.test.ts` mirroring the existing patterns in that folder.
2. Mock `globalThis.fetch` for any external calls.
3. Cover: success, validation failure, missing env var, downstream error.

### Adding a new CMS collection

1. Add a fixture in `tests/fixtures/<collection>.ts`.
2. Add MSW handlers for the new endpoint in `tests/helpers/mockCms.ts`.
3. Add a contract test under `tests/contract/` proving the data fetcher returns the expected shape.

### When the CMS schema drifts

Contract tests will fail loudly. Don't paper over by changing the fixture — first confirm the change is intentional, then update the fixture, then update any consumers. The fixture file is the source of truth for "what the CMS looks like to this app".

### Common pitfalls

- **Vitest hoisting:** `vi.mock(...)` factories are hoisted to the top of the file. Don't reference module-scope helpers from inside them — inline everything.
- **Module resolution for next-intl:** `next/navigation` and `@/i18n/routing` are mocked globally in `tests/setup/vitest.setup.ts`. If a component still fails to import, add it to the mocks rather than rewiring the component.
- **Playwright snapshots:** if a snapshot diff is failing in CI but not locally, you're on a different OS. Bake baselines on the same OS that runs the suite.
- **Lighthouse on `next start`:** numbers will be worse than production because there's no Cloudflare CDN. Treat budgets in §4 as a floor, not a target.

## 11. Known limitations

- Static export means **no Next.js API routes** — all dynamic logic lives in Cloudflare Functions, tested separately.
- Lighthouse runs against `pnpm start`, not Cloudflare edge — CDN/cache wins won't show.
- WebKit on Linux/macOS ≠ iOS Safari exactly; treat as a strong proxy.
- Visual snapshots are platform-specific; baselines are taken on macOS. Updating on a different OS = diffs.
