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

- [x] **Step 0** — Land this `TESTING.md` (no code yet).
- [ ] **Step 1** — Add Vitest + RTL deps; create `vitest.config.ts`, `vitest.setup.ts`, `tests/setup/`. Add `pnpm typecheck` and `pnpm test:unit`. Verify with one trivial test.
- [ ] **Step 2** — Unit tests for pure utilities: `cn`, `formatDateTime`, `formatMetaTitle`, `toKebabCase`, `withTrailingSlash`, `deepMerge`, `mergeOpenGraph`, `extractTocItems`, `useDebounce`. Target ≥ 90% on `src/utilities/`.
- [ ] **Step 3** — Add MSW; create `tests/fixtures/` with realistic Page, Post, Header, Footer samples (sourced from `cms-data.json` if present). Add `tests/helpers/mockCms.ts`.
- [ ] **Step 4** — Contract tests: `getDocument`, `getGlobals`, `getRedirects`, `cmsFetch` (incl. throttling + `cms-data.json` fallback). Add `pnpm test:contract`.
- [ ] **Step 5** — Cloudflare Functions tests: `_middleware` locale redirect, `contact` (honeypot + email + Resend mock), `subscribe` (CMS proxy + error path), `cms/[[path]]` (passthrough + missing env). Add `pnpm test:functions`.
- [ ] **Step 6** — Component tests for blocks: `Banner`, `Code`, `Content`, `MediaBlock`, `CallToAction`, `Accordion`, `OpeningHours`, `RelatedPosts`, `RenderBlocks` dispatcher, `RichText` serializer. Add `pnpm test:component`.
- [ ] **Step 7** — Component tests for cross-cutting components: `Link`, `Card`, `Pagination`, `PageRange`, `CollectionArchive`, `TableOfContents`, `ShareButtons`, `Cookies`, `NewsletterSignup`, `ContactForm`.
- [ ] **Step 8** — Install Playwright; create `playwright.config.ts` with 4 projects (Chromium Desktop 1280×800, Chromium Mobile Pixel 7, WebKit Desktop 1440×900, WebKit Mobile iPhone 14). `webServer: pnpm start`. Add `pnpm test:e2e`.
- [ ] **Step 9** — E2E smoke journeys: home renders both locales, locale auto-redirect, page slug renders, posts paginate, post detail, 404, header/footer present, theme toggle persists.
- [ ] **Step 10** — E2E for Map page (Leaflet hydration, no console errors, marker count > 0) and Search page (input → results render).
- [ ] **Step 11** — E2E for forms via mocked network: contact (success / invalid email / honeypot), newsletter (success / duplicate). Mock `/api/contact` + `/api/subscribe` at Playwright level.
- [ ] **Step 12** — Visual regression baselines: home, key pages, posts list, post detail, map, 404 — across all 4 projects. Mask volatile regions.
- [ ] **Step 13** — A11y scans (axe) on key pages — fail on serious + critical only. WCAG 2.1 AA tags.
- [ ] **Step 14** — Lighthouse CI: `lighthouserc.json` asserting §4 budgets against `/en/`, `/pl/`, `/en/posts`, one post detail, map page. Add `pnpm test:lhci`.
- [ ] **Step 15** — Wire `pnpm qa` (sequential, fail-fast) and `pnpm qa:fast`.
- [ ] **Step 16** — Documentation pass: fill §9–§10 with concrete invocations, snapshot-update workflow, fixture-update workflow, "when adding a new block / page, do X" recipe.

## 9. How to run (filled in step 16)

_To be completed in step 16 once scripts exist._

## 10. How to extend (filled in step 16)

_To be completed in step 16._

## 11. Known limitations

- Static export means **no Next.js API routes** — all dynamic logic lives in Cloudflare Functions, tested separately.
- Lighthouse runs against `pnpm start`, not Cloudflare edge — CDN/cache wins won't show.
- WebKit on Linux/macOS ≠ iOS Safari exactly; treat as a strong proxy.
- Visual snapshots are platform-specific; baselines are taken on macOS. Updating on a different OS = diffs.
