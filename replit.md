# OTV Card Maker

## Overview
Premium Bangladeshi TV news-style photo card generator for otv.online. Features iOS 26 Liquid Glass green-toned dark UI, Bengali-first interface, 67 templates (across 5 categories), draggable OTV logo, image positioning, Canva background removal, multi-format export, highlight word system, demo presets, and collapsible UI sections.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Express.js (serves static files + Canva API proxy)
- **Canvas Rendering**: HTML5 Canvas API for client-side card generation
- **PDF Export**: jsPDF library
- **Routing**: wouter
- **Background Removal**: Canva API (server-side proxy at /api/remove-bg)

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
- Category filter tabs for templates (All, Dark, Light, Photo, Themed, Premium)
- Grid view toggle for template gallery
- Horizontal scroll gallery with left/right buttons
- All border-radius uses G.r (22px) / G.rSm (16px) / G.rXl (28px)
- Collapsible sections via `CollapsibleSection` component with chevron toggle + Framer Motion animation

## Key Features
- 67 premium news card templates across 5 categories
- Upload main photo + channel logo + second photo for dual templates
- Bengali + English headline editing with dual headline support
- **Subheadline**: secondary text below headline
- **Bullet text**: multi-line bullet points rendered on card
- **Quote text**: quote block rendered with accent bar
- **Date text**: date line rendered on card
- **Highlight words**: comma-separated words highlighted with colored background in headline
- Category badge with Bengali labels (12 categories)
- Via text customization
- Person name/title for quote cards
- Accent color picker (10 colors with Bengali names)
- Live canvas preview with animated loading
- **Draggable OTV logo**: mouse/touch drag on canvas preview to reposition
- **Logo size controls**: ZoomIn/ZoomOut buttons + reset in Style tab
- **OTV logo transparent**: background removed, renders cleanly on all templates
- **Image positioning**: drag-to-reposition photos on canvas, zoom in/out (0.5x-2x)
- **Drag mode toggle**: switch between Logo Mode and Image Mode for canvas interaction
- **Canva BG removal**: one-click background removal via Canva API
- **Export size selector**: 1080x1080, 1200x1200, 2048x2048
- **File naming**: export filename derived from headline text
- Download PNG / JPG / PDF (A4) / Copy to Clipboard
- Free/Pro toggle (watermark control)
- Tab-based editor (কন্টেন্ট / স্টাইল / সেটিংস tabs)
- OTV logo auto-embedded on all cards
- Template category filtering + search
- Grid/horizontal view toggle for gallery
- Dual-photo upload for split templates
- Second headline field for dual/summary templates
- Person Name 2 / Title 2 fields for dual quote cards
- Framer Motion animations throughout
- **8 Bengali demo presets** with Random Demo button
- **Reset All button** to clear all fields
- **Background effect toggles**: grid lines, sandy grain, noise texture with intensity sliders
- **Text alignment**: left/center/right options
- **Collapsible UI sections**: all control panels collapse with chevron toggle

## Premium Template Textures
All templates now use premium texture utilities:
- `drawPaperTexture(ctx, w, h, color, intensity)` — subtle paper-like background for light templates
- `drawSandyGrain(ctx, w, h, intensity, warm)` — sandy/dusty grain overlay
- `drawEditorialGrid(ctx, x, y, w, h, spacing, color, fadeDir)` — editorial grid lines with fade
- `drawNoiseOverlay(ctx, w, h, opacity)` — fine noise for printed feel
- `drawAccentBar(ctx, x, y, w, h, color, glow?)` — decorative accent bar with optional glow
- `drawImageCoverPositioned(ctx, img, x, y, w, h, offsetX, offsetY, zoom, radius)` — positioned image rendering
- `drawPhoto(ctx, data, x, y, w, h, radius?)` — smart photo helper that uses offset/zoom from CardData

## Template Helper Functions
- `drawUserTextures(ctx, data, w, h)` — applies user-toggled grid/grain/texture effects based on CardData flags
- `drawSubheadline(ctx, data, x, y, maxW, color)` — renders subheadline if present
- `drawBulletText(ctx, data, x, y, maxW, color, bulletColor)` — renders multi-line bullets
- `drawQuoteBlock(ctx, data, x, y, maxW, barColor, textColor)` — renders quote with accent bar
- `drawDateLine(ctx, data, x, y, color)` — renders date text
- `drawHeadlineWithHighlight(ctx, text, x, y, maxW, fontSize, textColor, hlColor, lineH, align, fontFamily, highlightWords)` — per-word highlighting

## Demo Presets
8 Bengali presets: বিচার সংবাদ (Justice), রাজনীতি (Politics), খেলা (Sports), মতামত (Opinion), ট্রেন্ডিং (Trending), অপরাধ (Crime), অর্থনীতি (National/Economy), সামাজিক (Social). Each includes headline, subheadline, category, via text, accent color, and template selection. Random Demo button loads a random preset.

## File Structure
- `client/src/pages/home.tsx` - Main page with green glass premium UI, collapsible sections, demo presets, all controls
- `client/src/lib/templates.ts` - 67 template render functions (17 original + 50 via factories) + helper functions
- `client/src/lib/canvas-utils.ts` - Canvas drawing utilities with premium textures + 16 Bengali fonts
- `client/src/index.css` - Tailwind CSS with green glass scrollbar styling
- `client/src/App.tsx` - Router setup
- `client/public/images/otv-logo-transparent.png` - OTV logo (transparent)
- `attached_assets/otv_1773042288152.jpg` - Original OTV logo (fallback)
- `server/routes.ts` - Express routes including /api/remove-bg endpoint

## Template Categories (67 total)
- **Dark** (18): jamuna-dark, national-dark, world-report, breaking-red, sports-green, opinion-blue, investigation, classic-formal, crimson-dark, midnight-blue, forest-dark, sunset-orange, purple-haze, neon-cyan, rose-gold, steel-gray, emerald-night, coral-dark
- **Light** (16): quote-card, clean-news, minimal-light, grid-highlight, quote-highlight, news-summary, pastel-pink, ivory-clean, sage-green, sky-blue, lavender-light, peach-warm, mint-fresh, cream-classic, sand-warm, snow-white
- **Photo** (11): social-modern, photo-full-overlay, photo-blur-bg, photo-cinematic, photo-magazine, photo-editorial, photo-portrait, photo-panorama, photo-vignette, photo-duotone, photo-vintage
- **Themed** (12): dual-quote, dual-quote-split, ramadan-green, eid-gold, victory-red, independence-green, election-blue, weather-cyan, health-green, tech-blue, economy-gold, education-purple
- **Premium** (10): glass-card, neon-glow, gradient-mesh, paper-texture, film-grain, retro-wave, luxury-black, royal-purple, fire-red, ocean-deep

## Factory Template System
5 factory functions generate most new templates (all upgraded with premium textures):
- `makeGradientCard(c1, c2, accent, glowColor)` - Dark gradient with editorial grid + noise
- `makeLightCard(bg1, bg2, accent, textColor)` - Light cards with paper texture + grain
- `makePhotoOverlayCard(overlayStops, accent, badgeBg, badgeText)` - Photo-centric with noise overlay
- `makeThemedCard(c1, c2, accent, glowColor, decorFn?)` - Themed with grid + glow
- `makePremiumCard(c1, c2, accent, borderAlpha, glowColor)` - Premium with editorial grid + fine borders

## Fonts
- 16 selectable Bengali fonts via `BANGLA_FONT_OPTIONS` in canvas-utils.ts
- Sources: Google Fonts + fonts.maateen.me (SiyamRupali, SolaimanLipi, Kalpurush, Nikosh, Akaash, Mukti, Bangla)
- Font selector UI in Style tab — shows preview in each font's Bengali name
- Templates use `bnFont(data)` / `hlFont(data)` helpers to respect user's font selection
- Default: Noto Sans Bengali; Fallback: Hind Siliguri; Headlines: Montserrat + selected Bengali font

## CardData Interface
headline, headline2, subheadline, bulletText, quoteText, dateText, category, viaText, mainPhoto, secondPhoto, channelLogo, otvLogo, personName, personTitle, personName2, personTitle2, highlightColor, highlightWords, otvLogoX, otvLogoY, otvLogoSize, banglaFont?, headlineFont?, imageOffsetX?, imageOffsetY?, imageZoom?, gridEnabled?, grainEnabled?, textureEnabled?, gridIntensity?, grainIntensity?, textAlign?, exportSize?

## Image Positioning System
- `imageOffsetX/imageOffsetY` (pixels): offset the photo within its container
- `imageZoom` (0.5-2.0): zoom level for the photo
- `dragMode` state: "logo" or "image" — determines what dragging on preview affects
- `drawPhoto(ctx, data, ...)` helper delegates to `drawImageCoverPositioned` when offsets are non-default
- Reset button resets position + zoom to defaults

## Canva Background Removal
- Endpoint: POST /api/remove-bg
- Accepts multipart form data (image file) or base64 JSON
- Uses CANVA_CLIENT_ID + CANVA_CLIENT_SECRET (OAuth2 client credentials)
- Flow: upload → poll → edit (background_remove) → poll → download → return base64 PNG
- UI: "BG Remove" button on photo preview, shows loading spinner during processing
- Note: client_credentials grant type may not be supported by Canva — pre-existing auth issue

## drawOtvWatermark
Signature: `(ctx, data: CardData)` - reads otvLogoX/Y/Size from data with `??` nullish coalescing defaults. Used in all 67 templates.

## Canvas
- Preview size: 1200x1200px
- Export sizes: 1080x1080, 1200x1200, 2048x2048 (selectable in Settings tab)
- Free tier diagonal watermark: "OTV.ONLINE" at 10% opacity
