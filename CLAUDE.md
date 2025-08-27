# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Asep Bagja's personal website (bepitulaz.github.io) built with Astro, a modern static site generator. The site features a bilingual design (English and Indonesian) with content about his work, blog posts, music releases, and workspace setup.

## Development Commands

All commands are run from the root directory:

```bash
npm run dev      # Start development server at localhost:4321
npm run build    # Build production site to ./dist/
npm run preview  # Preview build locally before deploying
```

## Architecture & Structure

### Content Management
The site uses Astro's content collections system defined in `src/content/config.js`:
- **Blog Collection**: Markdown blog posts with frontmatter (title, date, images, categories, summary)
- **Music Collection**: JSON data for music releases and discography
- **Workspace Collection**: JSON data for equipment and tools used

### Internationalization
Bilingual content structure:
- English content: `/src/content/blog/en/`, `/src/pages/` (root level)
- Indonesian content: `/src/content/blog/id/`, `/src/pages/id/`
- Shared components with language-specific variants (e.g., `Navbar.astro` vs `NavbarIndonesia.astro`)

### Dynamic Routing
- `[...post].astro`: Dynamic blog post pages for both languages
- `[...category].astro`: Category-based blog listing pages
- Separate routing for Indonesian pages under `/id/` path

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Preline Components**: UI component library integrated via plugin
- **Custom Font**: Archivo Black for headings
- Global styles in `src/styles/global.css`

### Static Assets
- **Images**: Blog images in `/public/blog-img/`, portfolio images in `/public/portfolio-img/`
- **Music Assets**: Album artwork in `/public/music-img/`
- **Workspace Images**: Equipment photos in `/public/workspace-img/`

## Deployment

The site deploys automatically to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch. The workflow uses the official Astro action (`withastro/action@v4`) for building and deployment.

## Key Dependencies

- **Astro**: Core framework with MDX, sitemap, and Tailwind integrations
- **astro-seo**: SEO meta tags management
- **Preline**: UI component library
- **Tailwind CSS**: Styling framework with forms plugin