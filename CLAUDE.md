# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

**Before generating any code, Claude Code MUST first check the `/docs` directory for relevant documentation files.** All implementation decisions should align with the guidance found there. If a relevant docs file exists for the feature or technology being worked on, follow it before writing any code.
- /docs/ui.md


## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configured via `postcss.config.mjs` and `@tailwindcss/postcss`)

## Architecture

This is a fresh Next.js App Router project. All routes live under `src/app/` using the file-system routing convention:
- `layout.tsx` — root layout with Geist font variables applied to `<body>`
- `page.tsx` — the home route (`/`)
- `globals.css` — global styles imported in the root layout

New routes are added as folders with `page.tsx` files under `src/app/`. Server Components are the default; add `"use client"` at the top of a file when client-side interactivity is needed.
