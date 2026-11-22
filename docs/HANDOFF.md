# Mac Agent Handoff — `asepbagja.com` Freelance & Consulting Repositioning

**Target repo:** `https://github.com/bepitulaz/bepitulaz.github.io` (`main` branch, auto-deploys to GitHub Pages via `.github/workflows/`)
**Author:** Hermes (Linux profile `asep`)
**Date:** 2026-11-22

---

## §0 Decisions LOCKED

Every positioning and structural decision below has been settled with Asep. Do not re-ask or invent agency framing.

| # | Decision | Locked value |
|---|---|---|
| D1 | Primary consulting & freelance brand | **Asep Bagja** (`asepbagja.com`). All inbound consulting, portfolio proof, and contact flow through `asepbagja.com`. |
| D2 | Role of **Chloe & Matt OÜ** (`chloematt.eu`) | **B2B contracting & invoicing entity only** (Estonian Registry no. `14305217`). `chloematt.eu` has already been reduced to a 1-page corporate card pointing here. Never market an agency or a "two-person studio". |
| D3 | Role of **Nanas Sound OÜ** (`nanas.ee`, `nanas.build`) | **Flagship product company & live engineering proof.** Operated by Nanas Sound OÜ. Showcases production AI-assisted CAD (`nanas.build`), iOS/macOS music apps (`AirBending`, `Bolabolabola`), and embedded hardware (`MES Arpeggiator`, `Mash Machine`). `MADE BY ME` is unreleased: never mention it on the site. |
| D4 | Music / DJ framing | **Hobby & creative craft (`bepitulaz`), NOT a dual freelance career.** Frame music as the personal craft that inspired Nanas Sound, never as a professional DJ service. |
| D5 | Dead links to remove | Replace every reference to `https://www.nanassound.com` (currently in `src/pages/about.astro` lines 72 & 77) with `https://www.nanas.ee` and `https://www.nanas.build`. |
| D6 | Visual & technical preservation | **Keep the Three.js Estonia background (`EstoniaBackground.astro`, `estonia-scene.ts`), Season Switcher, Liquid Glass cards (`glass-ice`, `glass-ice-card`), Tailwind palette (`cream`, `charcoal`, `sage-*`), and Indonesian blog (`/id/blog`, `/[...category].astro`) intact.** |

---

## §1 Mission & Non-Goals

### Mission
Turn `asepbagja.com` from a casual link-tree into the authoritative personal storefront for **Asep Bagja — Principal Product & AI Engineer** while keeping its warm Nordic aesthetic and personal writing hub. When a founder, CTO, or client lands on `asepbagja.com` from LinkedIn, X, or `chloematt.eu`, they must immediately see:
1. **What Asep can be hired to build** (bounded AI integrations, Elixir/Phoenix & Python web systems, macOS/iOS apps, hardware-software bridges).
2. **Undeniable production proof** (both client work like Pistiik OÜ and own live products like `nanas.build` and `nanas.ee`).
3. **How engagement & billing work** (direct principal execution by Asep, clean EU B2B invoicing via Chloe & Matt OÜ, reg. 14305217).

### Non-Goals
- Do **not** touch or break the Three.js shader scene (`src/scripts/estonia-scene.ts`) or `#estonia-bg-hero-marker` scroll-fade anchor.
- Do **not** remove or break the Indonesian blog routes (`src/pages/id/blog.astro`, `src/pages/id/[...post].astro`, `src/pages/[...category].astro`, `src/pages/rss.xml.js`).
- Do **not** add heavy UI frameworks, external form backends, or contact databases — use direct `mailto:` CTAs with structured subject/body templates.

---

## §2 Hard Constraints & Existing Repo Facts

Verified against commit `86ada4c` (`main`):

| Item | Confirmed Repo Fact |
|---|---|
| Framework | Astro `^5.18.0`, static output, `@astrojs/tailwind` `^6.0.2`, `@astrojs/mdx`, `@astrojs/sitemap`, `preline` `^2.5.0` |
| Node version | `.tool-versions` pins `nodejs 22.14.0` |
| Fonts (`src/styles/global.css`) | `Manrope` (headings/display, weights 400–800) and `Inter` (body, weights 400–600) |
| Glass classes (`src/styles/global.css`) | `.glass-ice` (nav/pills) and `.glass-ice-card` (interactive cards with sheen & hover lift) |
| Background fade marker | `src/pages/index.astro` wraps `<Hero />` in `<div class="relative z-10" id="estonia-bg-hero-marker">`. **`estonia-scene.ts` measures `#estonia-bg-hero-marker` to compute the scroll-fade curve and season-switcher visibility — never rename or remove this ID.** |
| Analytics | Plausible script for `data-domain="asepbagja.com"` is already in `src/layouts/Layout.astro` |

---

## §3 UX & Copy Specification (Per File)

### 3.1 `src/components/Hero.astro`
Update the hero intro so visitors immediately understand Asep's engineering offer and product proof:

- **Name (`<h1>`):** `Asep Bagja`
- **Role subtitle:** `Principal Product & AI Engineer · Founder of Nanas Sound`
- **Location:** `Tallinn, Estonia · EU & Remote`
- **Paragraph 1 (The Offer & Proof):**
  > I help companies ship bounded AI integrations, full-stack web products, and hardware-software systems — without hiring a full team. Alongside client engineering, I build AI-assisted CAD tools at **[nanas.build](https://www.nanas.build)** and musical instruments at **[Nanas Sound](https://www.nanas.ee)**.
- **Paragraph 2 (Personal note):**
  > Off the clock, I compose electronic music under the alias **bepitulaz**.
- **CTA Row inside Hero (below paragraphs):**
  - Primary pill button: `Work with me →` (links to `/work`)
  - Secondary text/glass link: `Email asep@chloeandmatt.eu` (`mailto:asep@chloeandmatt.eu?subject=Consulting%20enquiry`)

### 3.2 `src/pages/index.astro` (Homepage Link Cards)
Update the `links` array in `src/pages/index.astro` so the top card leads directly to consulting/hiring, followed by live products and blogs:

1. **Hire Me — Consulting & Engineering** (`/work`, internal)
   - *Description:* `Bounded AI integrations, Elixir/Python/Swift product builds & technical discovery`
2. **nanas.build** (`https://www.nanas.build`, external)
   - *Description:* `AI-assisted custom CAD & 3D printing service (built & operated by Nanas Sound OÜ)`
3. **Nanas Sound** (`https://www.nanas.ee`, external)
   - *Description:* `B2C music software (AirBending, Bolabolabola) & DIY hardware`
4. **English Blog** (`https://asepbagja.substack.com`, external)
   - *Description:* `Build logs and essays on agentic AI, product engineering, and music tech`
5. **Blog Indonesia** (`/id/blog`, internal)
   - *Description:* `Artikel dalam Bahasa Indonesia tentang teknologi dan kehidupan di Estonia`
6. **About Me** (`/about`, internal)
   - *Description:* `16+ years of software engineering, background, and contact details`

### 3.3 New Page: `src/pages/work.astro` (`/work` — Freelance & Consulting Storefront)
Create `src/pages/work.astro` using `Layout.astro`, `Navbar.astro`, and `Footer.astro`. Match the clean Tailwind + `glass-ice-card` / `sage-*` aesthetic of the site.

Include these four sections on `/work`:

#### Section A — Header & Value Proposition
- **Eyebrow:** ` INDEPENDENT PRODUCT & AI ENGINEERING · TALLINN, ESTONIA `
- **Heading (`<h1>`):** `One senior engineer on the call, the architecture, and the code.`
- **Lede:**
  > Most teams that need an AI workflow or a focused digital product don’t need a six-figure agency retainer or a full-time ML hire. They need one experienced engineer to scope the problem, set a clean GDPR data boundary, wire the integration or product end-to-end, and hand over code their team can actually run.

#### Section B — What I Build for Clients (3 Cards)
1. **Bounded AI Integrations & Agent Workflows**
   - *Scope:* Identity/KYC routing, document handling, deterministic LLM pipelines, local ONNX inference, and agent-ready APIs.
   - *Discipline:* GDPR processor agreements, EU data residency, and zero-training terms settled before the first line of code.
2. **Focused Digital Products (Web & Native)**
   - *Scope:* End-to-end web applications (Elixir/Phoenix LiveView, TypeScript, Python), macOS/iOS apps (Swift/SwiftUI), and internal tools shipped in days or weeks rather than quarters.
   - *Discipline:* Working code, clean tests, and deployment notes handed over without lock-in.
3. **Hardware–Software & CAD Automation Bridges**
   - *Scope:* Programmatic CAD pipelines (`build123d` / FreeCAD), embedded Linux/Nerves (Raspberry Pi, ESP32), WebGPU/Three.js 3D viewers, and physical-digital product loops.

#### Section C — Production Proof (Client Work & Own Products)
Present real, verifiable systems (no fabricated metrics):
- **Pistiik OÜ (Client AI Integration)** — Built the AI routing layer behind Estonian KYC/KYB/AML broker [pistiik.com](https://pistiik.com), routing verification checks across providers by geography and document type behind a single pay-per-use interface.
- **nanas.build (Own Product — AI & Programmatic CAD)** — Built and operate [nanas.build](https://www.nanas.build), an AI-assisted custom CAD and 3D printing service in Tallinn featuring automated FreeCAD/build123d modelling, server-side 3D orbit previews, WebGPU multipart inspection, and a full JSON Agent API (`/llms.txt`).
- **Nanas Sound Apps & Hardware (Own Products)** — Shipped [AirBending](https://www.nanas.ee/airbending) and [Bolabolabola](https://www.nanas.ee/bolabolabola) on the App Store, and embedded firmware for [Mash Machine](https://mashmachines.com/) and [MES Arpeggiator](https://makeelectronicsound.com/collaborations).
- **Outcome-Billed Email Verifier (Reference Integration)** — Built a GDPR-first email verification pipeline checking syntax, MX, SMTP handshakes, catch-all, and role patterns with published false-positive rates.

#### Section D — How We Work & Invoicing (`Chloe & Matt OÜ`)
Clear, zero-confusion commercial block:
- **Direct execution:** You work directly with Asep Bagja from scoping to deployment. No account managers, no junior handoffs.
- **Engagement shapes:** Short discovery & architecture memos, fixed-scope 1–3 week product/integration builds, or focused fractional principal engineering.
- **EU B2B contracting & invoicing:**
  > All consulting and freelance engagements are contracted and invoiced through my Estonian company, **[Chloe & Matt OÜ](https://chloematt.eu)** (Estonian Commercial Register no. `14305217`, Tallinn, Estonia).
- **Primary CTA:**
  - Button: `Describe your project → asep@chloeandmatt.eu` (`mailto:asep@chloeandmatt.eu?subject=Project%20enquiry&body=Hi%20Asep%2C%0D%0A%0D%0AWhat%20we%20want%20to%20build%20or%20fix%3A%0D%0A%0D%0ATimeline%20%2F%20constraints%3A%0D%0A%0D%0A`)

### 3.4 `src/pages/about.astro` & `src/content/about/en.md`
Update `src/pages/about.astro` (and keep `src/content/about/en.md` in sync) to fix stale facts:
1. Replace both dead `https://www.nanassound.com` links with `https://www.nanas.ee` (and mention `https://www.nanas.build`).
2. Clarify the two Estonian companies cleanly:
   - **Nanas Sound OÜ** (`nanas.ee` & `nanas.build`) — where Asep builds his own B2C music tools, DIY hardware, and CAD/3D-printing service.
   - **Chloe & Matt OÜ** (`chloematt.eu`, reg. 14305217) — his Estonian company used for B2B software consulting and client invoicing.
3. Clarify music: playing piano/synthesizers and releasing electronic music under **Asep Bagja** / **bepitulaz** is his personal creative hobby, which fuels the product ideas behind Nanas Sound.
4. Show both contact emails clearly:
   - Client consulting & freelance: `asep@chloeandmatt.eu` (or link to `/work`)
   - Nanas Sound & product inquiries: `asep@nanas.ee`

### 3.5 `src/components/Navbar.astro` & `src/components/Footer.astro`
- **`src/components/Navbar.astro`:** Add `work` (`/work`) as the first navigation item before `discography`, `blog ID`, `blog EN`, `about`.
- **`src/components/Footer.astro`:** Add a LinkedIn icon link (`https://www.linkedin.com/in/asepbagja/`) alongside X, GitHub, and YouTube, and add a small sub-line under the copyright:
  `Consulting invoiced via Chloe & Matt OÜ (Reg. 14305217) · Products by Nanas Sound OÜ`

---

## §4 Phased Implementation Plan (Single PR or Direct Commit on Mac)

### Phase 1 — Copy, New `/work` Page & Navigation
1. Create `src/pages/work.astro` per §3.3.
2. Update `src/components/Hero.astro` and `src/pages/index.astro` per §3.1–3.2 (preserving `#estonia-bg-hero-marker`).
3. Update `src/pages/about.astro` and `src/content/about/en.md` per §3.4 (fixing `nanassound.com` → `nanas.ee` / `nanas.build`).
4. Update `src/components/Navbar.astro` and `src/components/Footer.astro` per §3.5.

### Acceptance Criteria & Verification Recipes
Run from repo root on Mac:

```bash
npm install
npm run build
```

Verify the built output in `dist/`:
1. `dist/work/index.html` exists and renders cleanly in both light and dark mode.
2. `grep -rn "nanassound.com" dist/ src/` returns **0 matches**.
3. `dist/index.html` still contains `id="estonia-bg-hero-marker"` and `id="estonia-season-switcher"`.
4. `npm run preview` → check `/` (WebGL background + season switcher + new Hire Me card), `/work` (case studies + Chloe & Matt OÜ billing note), `/about` (updated links), and `/id/blog` (Indonesian articles intact).

---

## §5 Invariants & Don'ts

- **NEVER** re-introduce agency framing ("we are a two-person studio", "Asep does not build"). Asep is the hands-on principal engineer.
- **NEVER** fabricate client logos, testimonials, or revenue numbers. Only cite verified work (`Pistiik OÜ`, `nanas.build`, `nanas.ee`, `Email Verifier`, `Mash Machine`, `MES Arpeggiator`).
- **NEVER** present DJing as a commercial service for hire.
- **NEVER** remove `#estonia-bg-hero-marker` from `src/pages/index.astro`.
