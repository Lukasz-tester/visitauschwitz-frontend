# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Generate sitemap + production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm generate:types   # Regenerate Payload TypeScript types
pnpm generate:importmap  # Regenerate Payload import map
```

## Architecture Overview

This is a **Next.js 15 + Payload CMS 3** project with internationalization (next-intl) for a multi-language website.

### Tech Stack
- **Framework:** Next.js 15 (App Router) with React 19
- **CMS:** Payload CMS 3 with MongoDB
- **i18n:** next-intl with locale-based routing (`/en/`, `/pl/`)
- **Styling:** Tailwind CSS with CSS variables, shadcn/ui components
- **Rich Text:** Lexical Editor
- **Storage:** Vercel Blob for media
- **Maps:** Leaflet + react-leaflet

### Directory Structure

```
src/
├── app/(frontend)/[locale]/   # App Router with locale segment
├── blocks/                    # Payload CMS content blocks (Banner, Code, Form, etc.)
├── collections/               # Payload collection configs (Pages, Posts, Media, Users)
├── globals/                   # Payload globals (Header, Footer)
├── components/                # React components
│   └── ui/                    # shadcn/ui components
├── providers/                 # React context providers (Theme, HeaderTheme)
├── i18n/                      # Localization config and message files
│   └── messages/              # Translation JSON files (en.json, pl.json)
├── fields/                    # Reusable Payload field configurations
├── hooks/                     # Payload collection hooks
├── access/                    # Payload access control functions
├── utilities/                 # Helper functions
├── heros/                     # Hero section variants
└── payload.config.ts          # Main Payload configuration
```

### Key Patterns

**Content Blocks System:** Pages use a blocks-based architecture. Each block type has its own component in `src/blocks/`. The `RenderBlocks` component dynamically renders blocks based on `blockType`.

**Hero Variants:** Pages can have different hero styles (none, highImpact, mediumImpact, lowImpact). Configuration in `src/heros/config.ts`, rendering via `RenderHero`.

**Localization:**
- Supported locales: `en` (default), `pl`
- Translations in `src/i18n/messages/`
- All routes prefixed with locale: `/en/about`, `/pl/about`
- Content fields in Payload are localized

**Static Generation:** Project uses static export with `dynamic = 'force-static'`. Sitemap generated at build time via `pnpm generate:sitemap`.

**Access Control:** Three patterns in `src/access/`:
- `authenticated` - logged-in users only
- `authenticatedOrPublished` - public sees published content
- `anyone` - fully public

### Payload CMS Plugins

The project uses several Payload plugins configured in `payload.config.ts`:
- **Translator** - AI translations using OpenAI
- **Redirects** - URL redirect management
- **Nested Docs** - Hierarchical categories
- **SEO** - Meta generation with live preview
- **Form Builder** - Dynamic forms
- **Search** - Full-text search for posts

### Component Patterns

- Server/Client split: Some components have separate `.tsx` (server) and `.client.tsx` (client) files
- UI components use shadcn/ui conventions in `src/components/ui/`
- Use `cn()` utility from `src/utilities/cn.ts` for conditional Tailwind classes

### Data Fetching

- `getDocument()` - Fetch single Payload document
- `getGlobals()` - Fetch header/footer globals
- `getMeUser()` - Get authenticated user
- Documents are fetched server-side with Payload's local API

### Type Generation

After modifying Payload collections or fields, regenerate types:
```bash
pnpm generate:types
```

Generated types are in `src/payload-types.ts`.
