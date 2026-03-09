# OTV Card Maker

## Overview
Premium Bangladeshi TV news-style photo card generator for otv.online. Features iOS 26 Liquid Glass dark UI, Bengali-first interface, 17 templates, draggable OTV logo, and multi-format export.

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
- Theme: Deep dark navy (#04060e) with blue/indigo accents
- All UI labels in Bengali (Noto Sans Bengali, Hind Siliguri)

## iOS 26 Liquid Glass UI
- `GLASS` constants for panel/input/border/blur styling
- Frosted glass panels: `backdropFilter: blur(50px) saturate(200%)`
- Animated ambient radial glows in background (Framer Motion)
- Inset highlight glass buttons with subtle shine
- Snap-scroll horizontal template gallery
- All border-radius uses GLASS.radius (24px) / radiusSm (18px) / radiusXl (32px)

## Key Features
- 17 premium news card templates
- Upload main photo + channel logo + second photo for dual templates
- Bengali + English headline editing with dual headline support
- Category badge with Bengali labels (12 categories)
- Via text customization
- Person name/title for quote cards
- Accent color picker (8 colors with Bengali names)
- Live canvas preview with animated loading
- **Draggable OTV logo**: mouse/touch drag on canvas preview to reposition
- **Logo size controls**: ZoomIn/ZoomOut buttons + reset in Style tab
- **OTV logo transparent**: background removed, renders cleanly on all templates
- Download PNG / JPG / PDF (A4) / Copy to Clipboard
- Free/Pro toggle (watermark control)
- Tab-based editor (কন্টেন্ট / স্টাইল / সেটিংস tabs)
- OTV logo auto-embedded on all 17 cards
- Dual-photo upload for split templates
- Second headline field for dual/summary templates
- Person Name 2 / Title 2 fields for dual quote cards
- Framer Motion animations throughout

## File Structure
- `client/src/pages/home.tsx` - Main page with iOS Liquid Glass UI
- `client/src/lib/templates.ts` - 17 template render functions
- `client/src/lib/canvas-utils.ts` - Canvas drawing utilities
- `client/src/App.tsx` - Router setup
- `client/public/images/otv-logo-transparent.png` - OTV logo (transparent)
- `attached_assets/otv_1773042288152.jpg` - Original OTV logo (fallback)

## Fonts
- Noto Sans Bengali (primary Bengali font)
- Hind Siliguri (Bengali fallback)
- Montserrat (Headlines, English text)

## Template IDs
jamuna-dark, national-dark, quote-card, clean-news, dual-quote, world-report, breaking-red, sports-green, opinion-blue, investigation, social-modern, classic-formal, minimal-light, dual-quote-split, grid-highlight, quote-highlight, news-summary

## CardData Interface
headline, headline2, category, viaText, mainPhoto, secondPhoto, channelLogo, otvLogo, personName, personTitle, personName2, personTitle2, highlightColor, otvLogoX, otvLogoY, otvLogoSize

## drawOtvWatermark
Signature: `(ctx, data: CardData)` - reads otvLogoX/Y/Size from data with `??` nullish coalescing defaults. Used in all 17 templates.

## Canvas
- Size: 1200x1200px
- Free tier diagonal watermark: "OTV.ONLINE" at 10% opacity
