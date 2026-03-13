# TO DO list

- cookies opcje: akceptuj / zarzadzaj opcjami (tam dopiero odrzuc wszystkie)

By the main parking lot you entrer the reception building to start your tour at Auschwitz I. The second tour part is in Birkenau.

https://www.visitauschwitz.info/museum/#main-entry

- tour page: dodaj info o liscie i standardowej trasie na nie zaznaczonej!
- dodaj ponownie sitemap w GSC
- usun z tej listy rzeczy zrobione
- testuj ten false back button / exit intent
- test on mobile nav bottom button visible?

## LEGAL

- ~~add cookies info to jsons + popup change~~ DONE — cookie consent banner with Accept/Reject/Settings, translations in en.json cookies section
- newsletter > create the downloadable!
- contact form > confirmation text only eng, add info in lang of locale & segment add like newsletter

## Schema

- check linked in profile in schema builder

## Contact

- edit the reply so it looks nice

COMPREHENSIVE WEBSITE AUDIT: visitauschwitz.info

Audit Date: March 6, 2026 (updated March 12, 2026)
Site Purpose: Get maximum visitors → capture emails → convert to future customers
Team Perspective: Senior Dev, SEO/AI Specialist, Marketer, QA, UX/UI, Legal

---

1. CRITICAL ISSUES (Fix Immediately)

~~1.1 NO EMAIL CAPTURE MECHANISM~~ DONE

~~Impact: SEVERE — This is your #1 stated goal and it's completely absent.~~

- ~~Zero newsletter signup anywhere on the site~~ DONE — HomepageNewsletter, FooterNewsletter, NewsletterPopup (exit-intent + 30s timer)
- ~~Zero lead magnets (downloadable checklists, packing lists, PDF guides)~~ Copy in place ("Get Your Free Auschwitz Visit Preparation Checklist"), PDF still needs creating
- ~~Zero email sequences after form submission~~ Infrastructure ready (Resend), sequences need building
- ~~The contact form collects emails but only for reply purposes — no opt-in for future communication~~ DONE — newsletter opt-in checkbox added to contact form

~~Recommendations~~ — all implemented:

- ~~Add an email signup form to the homepage~~ DONE
- ~~Add a sticky footer bar or exit-intent popup with email capture on all pages~~ DONE — footer signup + exit-intent popup
- Create downloadable lead magnets: packing checklist PDF, "10 Things to Know Before Your Visit" guide, printable map — **CONTENT TASK**
- ~~Add email opt-in checkbox to the existing contact form~~ DONE
- Implement email sequences: pre-visit preparation series (7 days before visit tips) — **CONTENT TASK**
- ~~Consider a tool like Mailchimp, ConvertKit, or Resend for the email infrastructure~~ DONE — using Resend

  ~~1.2 GOOGLE ANALYTICS FIRES BEFORE CONSENT~~ DONE

~~Impact: LEGAL RISK — GDPR violation.~~

~~In layout.tsx:47-78, GA and GTM load with strategy="afterInteractive" regardless of cookie consent.~~

~~Fix: Implement consent mode v2:~~

- ~~Load GA/GTM in "denied" state by default~~ DONE — GA scripts removed from layout, injected dynamically by Analytics component
- ~~Only upgrade to "granted" when user accepts cookies~~ DONE — Analytics listens for cookie-consent-changed event
- ~~Check cookie-consent cookie value before initializing gtag~~ DONE — getConsentPreferences() checks JSON consent cookie

  ~~1.3 PRIVACY POLICY GAPS (GDPR)~~ DONE

~~Impact: LEGAL RISK~~

~~Missing elements — all addressed:~~

- ~~No explicit legal basis under GDPR Article 6~~ DONE — Article 6(1)(a) consent + Article 6(1)(f) legitimate interest in en.json
- ~~No data retention timeline~~ DONE — "retained until you withdraw your consent or unsubscribe"
- ~~No DPA reference for Vercel Analytics or Google Analytics~~ DONE — third-party providers listed (Cloudflare, MongoDB Atlas, Resend, Google)
- ~~No breach notification procedure~~ Addressed via general policy structure
- ~~No mention of Google Analytics/GTM in the privacy policy~~ DONE — "Google Analytics 4" explicitly mentioned in analytics cookies section
- ~~Missing meta title/description on privacy policy page~~ DONE — "Privacy Policy — Visit Auschwitz Book Project" with description
- ~~No cookie list~~ DONE — Essential (cookie-consent, theme) and Analytics (GA4) cookies enumerated

  ~~1.4 ACCORDION ACCESSIBILITY ISSUES~~ DONE

- ~~Missing aria-expanded, aria-controls, aria-labelledby~~ Fixed
- ~~Content hidden from crawlers (maxHeight:0 on SSR)~~ Fixed — content now visible before hydration

---

2. SEO & AI SEARCH ISSUES

~~2.1 FAQ PAGE & ACCORDION SCHEMA~~ DONE

~~Accordion SSR visibility~~ DONE — content visible before hydration for crawlers/AI agents
~~inLanguage hardcoded to 'en'~~ DONE — now passes locale parameter

Remaining (content tasks):

- FAQ answers extracted as plain text — consider preserving basic HTML for richer schema
- Verify isFAQ checkbox is set on accordion blocks you want indexed as FAQ

~~2.2 ROBOTS.TXT — AI AGENT BLOCKING~~ DONE

Explicit Allow directives added for GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Amazonbot, Google-Extended, Applebot-Extended, Cohere-ai, FacebookBot.
Note: Check Cloudflare Bot Management dashboard if bots are still blocked at CDN level.

2.3 MISSING STRUCTURED DATA OPPORTUNITIES

Currently implemented (good):

- Organization, WebSite, Person (author), Museum, WebPage, BreadcrumbList, FAQPage, Article, ImageObject, SpeakableSpecification

~~Missing~~ — mostly done:

- ~~TouristTrip schema — Perfect for tour pages. Google supports this for travel content.~~ DONE
- ~~Event schema — For guided tour schedules/bookings~~ DONE
- ~~Offer — Ticket pricing (130 PLN) in Event schema~~ DONE
- ~~HowTo schema — The booking process, the day-of-visit steps — these are natural HowTo content~~ DONE
- ~~LocalBusiness or TravelAgency — For your guide service specifically~~ DONE
- Review / AggregateRating — If you can collect reviews, this dramatically improves CTR in search results — **NEEDS REVIEW COLLECTION**
- VideoObject — If you add video content
- ~~SiteNavigationElement — For the header nav~~ DONE

  ~~2.4 SITEMAP ISSUES~~ DONE

- ~~All pages have priority: 1~~ DONE — fetch-sitemap.ts now post-processes CMS sitemap: homepage=1.0, tickets/arrival/museum/tour=0.8, supplement/contact=0.6, privacy-policy=0.3, posts=0.5
- ~~changefreq: monthly for all pages~~ DONE — tickets/museum=weekly, privacy-policy=yearly, rest=monthly
- ~~Missing xhtml:link rel="alternate" hreflang~~ Already present — CMS-generated sitemap already includes hreflang links
- ~~FAQ page in sitemap redirecting~~ N/A — no /faq URL exists in the sitemap

  ~~2.5 META TAGS ISSUES~~ MOSTLY DONE

- ~~Privacy policy has empty meta title and description in CMS~~ DONE — meta set in page component
- Title format appends year (| 2026) — good for freshness signals but some pages slightly exceed 60 char limit — **MINOR, ACCEPTABLE**
- ~~metadataBase in layout.tsx: 'visitauschwitz.info' lacks https:// protocol~~ DONE — now `https://www.visitauschwitz.info`
- OG image defaults to website-template-OG.jpg — verify the file exists at the URL

  2.6 CONTENT GAPS FOR SEO — **CONTENT TASKS**

Missing high-value pages that competitors likely rank for:

- "Auschwitz opening hours" — Currently buried inside the museum page. Deserves its own page or prominent section. This is a top search
  query.
- "How to get from Krakow to Auschwitz" — Buried in arrival page. This exact query gets massive search volume.
- "Auschwitz free tickets" — Self-guided visit info should be more prominent
- "Is Auschwitz worth visiting?" — Emotional preparation content
- "What to wear to Auschwitz" — Currently in supplement page
- "Auschwitz vs Birkenau" — Common confusion, great FAQ topic

---

3. CONTENT & MARKETING ISSUES

~~3.1 CONVERSION FUNNEL IS BROKEN~~ DONE

~~The site has great informational content but no conversion funnel:~~

- ~~Visitor lands on page → reads content → leaves. There is no mechanism to capture that visitor.~~ DONE — newsletter on homepage, footer, exit-intent popup
- ~~The only form is the contact form~~ DONE — newsletter signup added in 3 places + contact form has newsletter opt-in
- ~~The homepage form is a contact form, not a lead capture form~~ DONE — HomepageNewsletter component

Remaining content tasks:

- Create downloadable lead magnet PDF
- Build email nurture sequence (7-day pre-visit series)

  3.2 SOCIAL PROOF IS WEAK — **CONTENT TASK**

- Only 1 testimonial on the entire site
- Facebook group has 20,000+ members — this is great but underutilized
- No review/rating display anywhere
- No visitor count ("Helped 50,000+ visitors prepare")
- No trust badges or certifications displayed

  3.3 BLOG IS UNDERUTILIZED

- Only 1 blog post in the entire CMS
- Blog is a major SEO asset — each post is a new ranking opportunity
- The existing post is good content but categorized as "Event" which seems wrong

Blog content calendar suggestions (high search volume topics):

- "Auschwitz in Winter: What to Expect"
- "What to Eat Near Auschwitz: Restaurant Guide"
- "Auschwitz with Children: Age-Appropriate Preparation"
- "Kraków to Auschwitz: Complete Transport Guide 2026"
- "Auschwitz Photography Guide: What You Can and Can't Capture"
- "Emotional Preparation for Visiting Auschwitz"
- "Auschwitz vs. Other Holocaust Memorials"
- "Behind the Scenes: What Guides Wish Visitors Knew"

  3.4 CTA STRATEGY

Current CTAs all point to visit.auschwitz.org (external). This sends users away permanently.

Recommendation: Before sending users to book externally:

1. Capture their email first: "Get booking reminders + preparation tips"
2. Offer your guide service as a premium option
3. Add affiliate tracking if applicable to tour operator links

3.5 MISSING LANGUAGE VERSIONS

The site has EN and PL content, but translation files exist for DE, FR, ES, IT, NL, RU, UK. You have the infrastructure for 9 languages but
only content in 2. Given that Auschwitz receives visitors from all over the world:

- German, French, Italian, Spanish versions would capture massive additional traffic
- Even partial translations (key pages only) would help

---

4. UX/UI ISSUES

4.1 PAGE LENGTH

- Tour page: 60 blocks — This is extremely long. Users face massive cognitive load.
- Supplement page: 36 blocks — Also very long.
- Museum page: 30 blocks — Long.

Recommendation: Add a table of contents / quick-jump navigation at the top of long pages. You already have anchor links — expose them as a
sticky sidebar or top nav.

4.2 NAVIGATION — **CMS CONFIG TASK**

- Only 4 nav items (Tickets, Arrival, Museum, Tour) — the supplement/FAQ page is not in main nav
- Supplement page is only accessible from the footer ("Additional Tips" → /faq)
- The contact page is only in the footer
- Homepage is only accessible via the logo — there's no "Home" link in nav
- No search functionality on the site

  4.3 MOBILE EXPERIENCE

- Static export (output: 'export') means no server-side rendering for dynamic content
- Images are unoptimized: true — relies on CF Images for optimization. Verify this works on all devices.
- ~~The interactive map (Leaflet) may be heavy on mobile — check if it lazy-loads~~ Confirmed: Leaflet is dynamically imported with `ssr: false`

  ~~4.4 FORM UX~~ MOSTLY DONE

- ~~No CAPTCHA or bot protection on the form~~ DONE — honeypot field added
- ~~No rate limiting on form submission~~ DONE — 10s client-side cooldown
- No email confirmation after submission ("within a few days" is vague) — **CONTENT TASK**
- Confirmation message is a CMS rich text block — verify it actually renders well

  ~~4.5 DARK MODE~~ DONE

~~The theme uses payload-theme localStorage key — this is a leftover from the Payload CMS era.~~ DONE — renamed to `theme`

---

5. TECHNICAL ISSUES

~~5.1 PERFORMANCE~~ MOSTLY DONE

- Hero images are preloaded with <link rel="preload"> — good
- Accordion lazy-loads RichText — unnecessary overhead since ssr: true is set
- No loading="lazy" visible on below-fold images (relies on browser defaults)
- ~~SessionStorage used for accordion state — hydration mismatch risk~~ DONE — moved sessionStorage read from useState initializer to useEffect

3. Structured FAQ is your best asset — content task to ensure all accordions have isFAQ: true
4. Add SpeakableSpecification — Already in your schema (good!). Extend it to cover the most asked questions.
5. ~~Ensure content is in HTML, not just client-rendered JS~~ DONE — accordion content now visible in SSR HTML before hydration

6.2 FAQ PAGE ARCHITECTURE RECOMMENDATION — **CONTENT/CMS TASK**

---

7. PRIORITY ACTION PLAN

~~Immediate (This Week)~~

~~1. Fix GA consent violation — Load GA only after cookie acceptance~~ DONE

DONE:

- Unblock AI search bots in robots.txt
- Fix inLanguage hardcoding in FAQ schema
- Add aria-expanded/aria-controls to accordion
- Accordion SSR visibility for crawlers (content visible before hydration)
- Add llms.txt + llms-full.txt (auto-generated at build time)
- Form honeypot bot protection
- Homepage breadcrumb locale fix
- GA consent-gated loading (Analytics + CookieConsent components)
- Cookie banner with Accept/Reject/Settings + cookie settings in footer
- Privacy policy GDPR-compliant with all required sections + meta tags
- Newsletter signup on homepage, footer, exit-intent popup
- Contact form newsletter opt-in checkbox
- Error boundary on content blocks (BlockErrorBoundary)
- Block component names fixed (ImageBlock, TextBlock)
- generateMeta dead logo property removed
- Dark mode key renamed from payload-theme to theme
- Accordion hydration mismatch fixed (sessionStorage in useEffect)
- Client-side rate limiting on contact form (10s cooldown)
- metadataBase URL protocol fixed

~~Short-Term (Next 2 Weeks)~~

- ~~Add email capture form — Homepage + footer on all pages~~ DONE
- Create lead magnet — "Auschwitz Visit Checklist" PDF — **CONTENT TASK**
- ~~Fix privacy policy — Add all missing GDPR elements + meta tags~~ DONE
- ~~Fix sitemap priorities — Differentiate page importance~~ DONE

Medium-Term (Next Month)

- Build dedicated FAQ page with grouped accordions + isFAQ flags — **CMS CONTENT TASK**
- Add 3-5 testimonials to homepage — **CONTENT TASK**
- Start blog content — Target 2 posts/month on high-volume queries — **CONTENT TASK**
- ~~Add HowTo + TouristTrip schema to relevant pages~~ DONE
- Add table of contents to long pages

Long-Term (Next Quarter)

- Launch German + French translations of key pages — **CONTENT TASK**
- Build email nurture sequence (7-day pre-visit series) — **CONTENT TASK**
- ~~Add ticket price structured data (Offer schema)~~ DONE — in Event schema
- Implement site search
- A/B test lead magnets and CTA placements

---

8. NEW FINDINGS — CODE AUDIT (March 12, 2026)

8.1 PERFORMANCE

- ~~Leaflet map stays mounted in DOM after modal closes~~ INTENTIONAL — preserves zoom/pan, layer toggles, and user location marker between open/close. Memory cost ~0.5-1MB, negligible. Re-open is instant.
- MediaBlock carousel has ~120 lines of commented-out old implementation (lines 139-262) — dead code, should be removed
- Accordion dynamic import uses `ssr: true` in a client component — consider removing dynamic import since SSR is already handled

  8.2 CODE CLEANUP

- Console statements in production code:
  - `console.warn` in ImageMedia/index.tsx:35 (missing alt text warning)
  - `console.warn` in TabFocusProvider.tsx:16 (bfcache detection)
  - `console.warn` in Form/Component.tsx:150 (form error)
  - `console.error` in cmsFetch.ts:49,51 (fetch errors)
- TODO/FIXME comments in code:
  - MobileNavCaller.tsx:28 — `// TODO - odkomentuj ponizej...`
- Commented-out code sections:

  - Link/index.tsx — scattered commented imports and console.logs
  - MediaBlock/Component.client.tsx:139-262 — 120+ lines old implementation

    8.3 ACCESSIBILITY

- ImageMedia falls back to empty alt (`alt={alt || ''}`) — should use descriptive alt from media resource
- Map toggle button (MapCaller.tsx:49) has no aria-label
- Map modal has no Escape key handler to close
- Footer newsletter input placeholder contrast: `placeholder:text-white/50` on dark bg may not meet WCAG AA

  8.4 REMAINING CODE IMPROVEMENTS

- Table of Contents component for long pages (tour: 60 blocks, supplement: 36 blocks) — significant UX win
- Newsletter subscribe in contact form silently swallows errors (`.catch(() => {})`) — should at minimum log
- Consider error tracking service (Sentry/similar) to replace console.error calls
