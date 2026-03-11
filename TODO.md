# TO DO list

## LEGAL

create geolocation page section and add eng text, e.g. in "dataCollection": add:
"item5": "Geolocation data — only when you explicitly use the \"Locate Me\" feature on the interactive map. Your location is processed locally in the browser to display your position on the map and is not stored or transmitted to any server"

- add cookies info to jsons + popup change
- test - redirect from .../ > ro locale /en
- newsletter > create the downloadable!
- contact > confirmation text into locale & segment add like newsletter

## Schema

- check linked in profile in schema builder

## Map

- remake the map with localized names
- replace buildings with the ones actually open

## Contact

- edit the reply so it looks nice

COMPREHENSIVE WEBSITE AUDIT: visitauschwitz.info

Audit Date: March 6, 2026
Site Purpose: Get maximum visitors → capture emails → convert to future customers  
 Team Perspective: Senior Dev, SEO/AI Specialist, Marketer, QA, UX/UI, Legal

---

1. CRITICAL ISSUES (Fix Immediately)

1.1 NO EMAIL CAPTURE MECHANISM

Impact: SEVERE — This is your #1 stated goal and it's completely absent.

- Zero newsletter signup anywhere on the site
- Zero lead magnets (downloadable checklists, packing lists, PDF guides)
- Zero email sequences after form submission
- The contact form collects emails but only for reply purposes — no opt-in for future communication

Recommendations:

- Add an email signup form to the homepage (above fold or after hero) with a compelling offer: "Get your free Auschwitz Visit Preparation
  Checklist"
- Add a sticky footer bar or exit-intent popup with email capture on all pages
- Create downloadable lead magnets: packing checklist PDF, "10 Things to Know Before Your Visit" guide, printable map
- Add email opt-in checkbox to the existing contact form
- Implement email sequences: pre-visit preparation series (7 days before visit tips)
- Consider a tool like Mailchimp, ConvertKit, or Resend for the email infrastructure

  1.2 GOOGLE ANALYTICS FIRES BEFORE CONSENT

Impact: LEGAL RISK — GDPR violation.

In layout.tsx:47-78, GA and GTM load with strategy="afterInteractive" regardless of cookie consent. The CookiePopup component sets a
cookie-consent cookie but nothing reads it before firing analytics. GA fires for every visitor, whether they accept or decline.

Fix: Implement consent mode v2:

- Load GA/GTM in "denied" state by default
- Only upgrade to "granted" when user accepts cookies
- Check cookie-consent cookie value before initializing gtag

  1.3 PRIVACY POLICY GAPS (GDPR)

Impact: LEGAL RISK

Missing elements:

- No explicit legal basis under GDPR Article 6 (legitimate interest vs. consent)
- No data retention timeline — says "indefinitely" for contact form data (GDPR requires defined periods)
- No DPA reference for Vercel Analytics or Google Analytics
- No breach notification procedure
- No mention of Google Analytics/GTM in the privacy policy — only Vercel Analytics mentioned
- Missing meta title/description on privacy policy page (CMS shows empty)
- No cookie list — the policy should enumerate all cookies used (GA, GTM, cookie-consent, payload-theme, sessionStorage accordion states)

  1.4 ~~ACCORDION ACCESSIBILITY ISSUES~~ DONE

- ~~Missing aria-expanded, aria-controls, aria-labelledby~~ Fixed
- ~~Content hidden from crawlers (maxHeight:0 on SSR)~~ Fixed — content now visible before hydration

---

2. SEO & AI SEARCH ISSUES

2.1 FAQ PAGE & ACCORDION SCHEMA

~~Accordion SSR visibility~~ DONE — content visible before hydration for crawlers/AI agents
~~inLanguage hardcoded to 'en'~~ DONE — now passes locale parameter

Remaining:

- FAQ answers extracted as plain text — consider preserving basic HTML for richer schema
- Verify isFAQ checkbox is set on accordion blocks you want indexed as FAQ

~~2.2 ROBOTS.TXT — AI AGENT BLOCKING~~ DONE

Explicit Allow directives added for GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Amazonbot, Google-Extended, Applebot-Extended, Cohere-ai, FacebookBot.
Note: Check Cloudflare Bot Management dashboard if bots are still blocked at CDN level.

2.3 MISSING STRUCTURED DATA OPPORTUNITIES

Currently implemented (good):

- Organization, WebSite, Person (author), Museum, WebPage, BreadcrumbList, FAQPage, Article, ImageObject, SpeakableSpecification

Missing:

- ~~TouristTrip schema — Perfect for tour pages. Google supports this for travel content.~~ DONE
- ~~Event schema — For guided tour schedules/bookings~~ DONE
- Offer / AggregateOffer — Ticket pricing (130 PLN, 170 PLN etc.) could appear as rich snippets
- ~~HowTo schema — The booking process, the day-of-visit steps — these are natural HowTo content~~ DONE
- ~~LocalBusiness or TravelAgency — For your guide service specifically~~ DONE
- Review / AggregateRating — If you can collect reviews, this dramatically improves CTR in search results
- VideoObject — If you add video content
- ~~SiteNavigationElement — For the header nav~~ DONE

  ~~2.4 SITEMAP ISSUES~~ DONE

- ~~All pages have priority: 1~~ DONE — fetch-sitemap.ts now post-processes CMS sitemap: homepage=1.0, tickets/arrival/museum/tour=0.8, supplement/contact=0.6, privacy-policy=0.3, posts=0.5
- ~~changefreq: monthly for all pages~~ DONE — tickets/museum=weekly, privacy-policy=yearly, rest=monthly
- ~~Missing xhtml:link rel="alternate" hreflang~~ Already present — CMS-generated sitemap already includes hreflang links
- ~~FAQ page in sitemap redirecting~~ N/A — no /faq URL exists in the sitemap

  2.5 META TAGS ISSUES

- Privacy policy has empty meta title and description in CMS
- Title format appends year (| 2026) — This is good for freshness signals but means titles break 60 char limits on some pages: "Auschwitz
  Tickets: Discover Tour Types & Booking Tips | 2026" = 61 chars
- metadataBase in layout.tsx line 109: 'visitauschwitz.info' lacks https:// protocol — this could cause malformed canonical URLs in some
  edge cases
- OG image defaults to website-template-OG.jpg — but the site uses .webp everywhere else. Ensure this JPG exists and is optimized. Some
  platforms prefer JPG/PNG for OG images anyway (good), but verify the file exists at the URL.

  2.6 CONTENT GAPS FOR SEO

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

3.1 CONVERSION FUNNEL IS BROKEN

The site has great informational content but no conversion funnel:

1. Visitor lands on page → reads content → leaves. There is no mechanism to capture that visitor.
2. The only form is the contact form (3 fields: name, email, message) — and it's buried on /contact
3. The homepage form is a contact form, not a lead capture form

Funnel redesign recommendation:
AWARENESS: SEO/AI search → landing page
INTEREST: Valuable content + social proof
CAPTURE: Email signup (lead magnet / checklist)
NURTURE: Email sequence (7-day pre-visit series)
CONVERT: Tour booking recommendation / guide service

3.2 SOCIAL PROOF IS WEAK

- Only 1 testimonial on the entire site
- Facebook group has 20,000+ members — this is great but underutilized
- No review/rating display anywhere
- No visitor count ("Helped 50,000+ visitors prepare")
- No trust badges or certifications displayed

Recommendations:

- Add a testimonials section to the homepage (3-5 short quotes with names)
- Display Facebook group member count prominently
- Add a "Join 20,000+ visitors" CTA next to the email signup
- Consider embedding TripAdvisor or Google Reviews

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

4.2 NAVIGATION

- Only 4 nav items (Tickets, Arrival, Museum, Tour) — the supplement/FAQ page is not in main nav
- Supplement page is only accessible from the footer ("Additional Tips" → /faq)
- The contact page is only in the footer
- Homepage is only accessible via the logo — there's no "Home" link in nav
- No search functionality on the site

Recommendations:

- Add "Guide" or "Prepare" to main navigation pointing to FAQ/supplement
- Add a simple search (especially useful on mobile)
- Consider a mega-menu with sub-sections for long pages

  4.3 MOBILE EXPERIENCE

- Static export (output: 'export') means no server-side rendering for dynamic content
- Images are unoptimized: true — relies on CF Images for optimization. Verify this works on all devices.
- The interactive map (Leaflet) may be heavy on mobile — check if it lazy-loads

  4.4 FORM UX

- Contact form sends to /api/contact — but the site is a static export (output: 'export'). How does this API route work? If it's a Next.js
  API route, it won't exist in static export. This may be broken or proxied through Vercel.
- ~~No CAPTCHA or bot protection on the form~~ DONE — honeypot field added
- No form validation feedback beyond basic HTML required attributes
- No email confirmation after submission ("within a few days" is vague)
- Confirmation message is a CMS rich text block — verify it actually renders well

  4.5 DARK MODE

The theme uses payload-theme localStorage key — this is a leftover from the Payload CMS era. Not a functional issue but a minor code smell.

---

5. TECHNICAL ISSUES

5.1 PERFORMANCE

- Hero images are preloaded with <link rel="preload"> — good
- Accordion lazy-loads RichText — unnecessary overhead since ssr: true is set
- No loading="lazy" visible on below-fold images (relies on browser defaults)
- SessionStorage used for accordion state — this is fine but creates client-side hydration mismatch risk (useState initializer reads
  sessionStorage which doesn't exist on server)

  5.2 CODE QUALITY ISSUES

- RenderBlocks.tsx:17-18 — Block type mappings are misleading: Image: CodeBlock and Text: BannerBlock. These should match their actual
  block types.
- ~~extractContentSchema.ts — Uses Math.random() for IDs (line 53, 86) — not ideal for deterministic builds~~ DONE — replaced with deterministic `col-${index}` and `'content'` fallbacks
- generateMeta.ts:74 — logo property is a custom addition that won't be used by Next.js metadata system (the TODO comment confirms it)
- No error boundary wrapping blocks — one broken block could crash the whole page

  5.3 SECURITY

- Form submits to /api/contact without CSRF protection
- No rate limiting on form submission (client-side)
- CMS admin credentials should use a stronger password (noted for awareness)
- dangerouslySetInnerHTML is used for JSON-LD scripts — this is standard practice but ensure the CMS content is sanitized

---

6. AI SEARCH OPTIMIZATION (YOUR SPECIAL INTEREST)

6.1 MAKING YOUR SITE AI-AGENT FRIENDLY

Beyond unblocking AI bots (section 2.2), here's how to optimize for AI search:

1. ~~Add llms.txt~~ DONE — auto-generated at build time from CMS content (generate-llms-txt.ts)
2. ~~Add llms-full.txt~~ DONE — includes all FAQ items, section headings, descriptions
3. Structured FAQ is your best asset — AI agents love well-structured Q&A pairs. Your accordion-to-FAQPage schema is excellent. For the new
   FAQ page:

   - Group questions by topic (Booking, Transport, Rules, Preparation)
   - Keep answers concise (2-3 sentences) with optional "Read more" links
   - Use the isFAQ: true flag on all accordion blocks
   - Ensure answers are self-contained (don't just say "see our tickets page")

4. Add SpeakableSpecification — Already in your schema (good!). Extend it to cover the most asked questions.
5. ~~Ensure content is in HTML, not just client-rendered JS~~ DONE — accordion content now visible in SSR HTML before hydration

6.2 FAQ PAGE ARCHITECTURE RECOMMENDATION

For your new FAQ page:

/en/faq (or /en/guide)
├── Accordion Group 1: "Booking & Tickets" (isFAQ: true)
│ ├── How do I book Auschwitz tickets?
│ ├── Can I visit Auschwitz for free?
│ ├── What is the cancellation policy?
│ └── ...
├── Accordion Group 2: "Getting There" (isFAQ: true)
│ ├── How to get from Kraków to Auschwitz?
│ ├── Is there parking at Auschwitz?
│ └── ...
├── Accordion Group 3: "During Your Visit" (isFAQ: true)
│ ├── How long does the Auschwitz tour take?
│ ├── Can I take photos at Auschwitz?
│ └── ...
├── Accordion Group 4: "Preparation" (isFAQ: true)
│ ├── What should I wear to Auschwitz?
│ ├── Can children visit Auschwitz?
│ └── ...

Key technical requirements for FAQ SEO:

- Each accordion group needs isFAQ: true in CMS
- ~~Fix the inLanguage hardcoding bug~~ DONE
- ~~Ensure answers render in initial HTML (not hidden by JS)~~ DONE
- Keep answers between 50-300 words for optimal AI agent extraction
- Include specific data points in answers (prices, times, distances) — AI agents love concrete facts

---

7. PRIORITY ACTION PLAN

Immediate (This Week)

1. Fix GA consent violation — Load GA only after cookie acceptance

DONE:

- Unblock AI search bots in robots.txt
- Fix inLanguage hardcoding in FAQ schema
- Add aria-expanded/aria-controls to accordion
- Accordion SSR visibility for crawlers (content visible before hydration)
- Add llms.txt + llms-full.txt (auto-generated at build time)
- Form honeypot bot protection
- Homepage breadcrumb locale fix

Short-Term (Next 2 Weeks)

5. Add email capture form — Homepage + footer on all pages
6. Create lead magnet — "Auschwitz Visit Checklist" PDF
7. Fix privacy policy — Add all missing GDPR elements + meta tags
8. Fix sitemap priorities — Differentiate page importance

Medium-Term (Next Month)

10. Build dedicated FAQ page with grouped accordions + isFAQ flags
11. Add 3-5 testimonials to homepage
12. Start blog content — Target 2 posts/month on high-volume queries
13. Add HowTo + TouristTrip schema to relevant pages
14. Add table of contents to long pages

Long-Term (Next Quarter)

15. Launch German + French translations of key pages
16. Build email nurture sequence (7-day pre-visit series)
17. Add ticket price structured data (Offer schema)
18. Implement site search
19. A/B test lead magnets and CTA placements
