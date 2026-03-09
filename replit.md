# OTV Card Maker

## Overview
Premium Bangladeshi TV news-style photo card generator for otv.online. Features iOS 26 Liquid Glass green-toned dark UI, Bengali-first interface, 67 templates (across 5 categories), draggable OTV logo, and multi-format export.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Express.js (minimal, serves static files)
- **Canvas Rendering**: HTML5 Canvas API for client-side card generation
- **PDF Export**: jsPDF library
- **Routing**: wouter

## Branding
- Domain: otv.online
- Logo: /images/otv-logo-transparent.png (AI background-removed transparent PNG)
- Fallback logo: attached_assets/otv_1773042288152.jpg
- Theme: Deep dark green (#0a1208, #0d1a0f, #081410) with gold accents (#c8a832)
- All UI labels in Bengali (Noto Sans Bengali, Hind Siliguri)

## Green Glass Premium UI
- `G` constants for panel/input/border/blur styling (green-toned)
- Frosted glass panels: `backdropFilter: blur(50px) saturate(200%)`
- Green-tinted borders: rgba(120,180,120,0.08)
- Gold accent buttons and highlights (#c8a832, #d4b844)
- Animated ambient green/gold radial glows in background (Framer Motion)
- Category filter tabs for 68 templates (All, Dark, Light, Photo, Themed, Premium)
- Grid view toggle for template gallery
- Horizontal scroll gallery with left/right buttons
- All border-radius uses G.r (22px) / G.rSm (16px) / G.rXl (28px)

## Key Features
- 68 premium news card templates across 5 categories
- Upload main photo + channel logo + second photo for dual templates
- Bengali + English headline editing with dual headline support
- Category badge with Bengali labels (12 categories)
- Via text customization
- Person name/title for quote cards
- Accent color picker (10 colors with Bengali names)
- Live canvas preview with animated loading
- **Draggable OTV logo**: mouse/touch drag on canvas preview to reposition
- **Logo size controls**: ZoomIn/ZoomOut buttons + reset in Style tab
- **OTV logo transparent**: background removed, renders cleanly on all templates
- Download PNG / JPG / PDF (A4) / Copy to Clipboard
- Free/Pro toggle (watermark control)
- Tab-based editor (কন্টেন্ট / স্টাইল / সেটিংস tabs)
- OTV logo auto-embedded on all 68 cards
- Template category filtering + search
- Grid/horizontal view toggle for gallery
- Dual-photo upload for split templates
- Second headline field for dual/summary templates
- Person Name 2 / Title 2 fields for dual quote cards
- Framer Motion animations throughout

## File Structure
- `client/src/pages/home.tsx` - Main page with green glass premium UI
- `client/src/lib/templates.ts` - 68 template render functions (17 original + 51 new via factories)
- `client/src/lib/canvas-utils.ts` - Canvas drawing utilities
- `client/src/index.css` - Tailwind CSS with green glass scrollbar styling
- `client/src/App.tsx` - Router setup
- `client/public/images/otv-logo-transparent.png` - OTV logo (transparent)
- `attached_assets/otv_1773042288152.jpg` - Original OTV logo (fallback)

## Template Categories (68 total)
- **Dark** (18): jamuna-dark, national-dark, world-report, breaking-red, sports-green, opinion-blue, investigation, classic-formal, crimson-dark, midnight-blue, forest-dark, sunset-orange, purple-haze, neon-cyan, rose-gold, steel-gray, emerald-night, coral-dark
- **Light** (16): quote-card, clean-news, minimal-light, grid-highlight, quote-highlight, news-summary, pastel-pink, ivory-clean, sage-green, sky-blue, lavender-light, peach-warm, mint-fresh, cream-classic, sand-warm, snow-white
- **Photo** (11): social-modern, photo-full-overlay, photo-blur-bg, photo-cinematic, photo-magazine, photo-editorial, photo-portrait, photo-panorama, photo-vignette, photo-duotone, photo-vintage
- **Themed** (12): dual-quote, dual-quote-split, ramadan-green, eid-gold, victory-red, independence-green, election-blue, weather-cyan, health-green, tech-blue, economy-gold, education-purple
- **Premium** (11): glass-card, neon-glow, gradient-mesh, paper-texture, film-grain, retro-wave, luxury-black, royal-purple, fire-red, ocean-deep

## Factory Template System
5 factory functions generate most new templates:
- `makeDarkGradientCard(colors, accentColor)` - Dark gradient with glow
- `makeLightCleanCard(bgColor, topColor, accentColor)` - Light/clean cards
- `makePhotoCard(overlayColors, accentColor)` - Photo-centric overlays
- `makeThemedCard(gradient, glowColor, accentColor, badgeLabel)` - Themed variants
- `makePremiumCard(bgStyle, accentColor)` - Premium special effects

## Fonts
- 16 selectable Bengali fonts via `BANGLA_FONT_OPTIONS` in canvas-utils.ts
- Sources: Google Fonts + fonts.maateen.me (SiyamRupali, SolaimanLipi, Kalpurush, Nikosh, Akaash, Mukti, Bangla)
- Font selector UI in Style tab — shows preview in each font's Bengali name
- Templates use `bnFont(data)` / `hlFont(data)` helpers to respect user's font selection
- Default: Noto Sans Bengali; Fallback: Hind Siliguri; Headlines: Montserrat + selected Bengali font

## CardData Interface
headline, headline2, category, viaText, mainPhoto, secondPhoto, channelLogo, otvLogo, personName, personTitle, personName2, personTitle2, highlightColor, otvLogoX, otvLogoY, otvLogoSize, banglaFont?, headlineFont?

## drawOtvWatermark
Signature: `(ctx, data: CardData)` - reads otvLogoX/Y/Size from data with `??` nullish coalescing defaults. Used in all 68 templates.

## Canvas
- Size: 1200x1200px
- Free tier diagonal watermark: "OTV.ONLINE" at 10% opacity
