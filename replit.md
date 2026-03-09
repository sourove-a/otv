# OTV Card Maker

## Overview
Premium Bangladeshi TV news-style photo card generator for otv.online. Features flagship-level UI with motion graphics, Bengali font support, and 13 premium templates.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Express.js (minimal, serves static files)
- **Canvas Rendering**: HTML5 Canvas API for client-side card generation
- **PDF Export**: jsPDF library
- **Routing**: wouter

## Branding
- Domain: otv.online
- Logo: /images/otv-logo.png (transparent PNG)
- Theme: Deep dark navy (#04060e) with blue/cyan accents
- All UI labels in Bengali (Noto Sans Bengali, Hind Siliguri)

## Key Features
- 17 premium news card templates (13 original + 4 new)
- Upload main photo + channel logo + second photo for dual templates
- Bengali + English headline editing with dual headline support
- Category badge with Bengali labels
- Via text customization
- Person name/title for quote cards
- Accent color picker (8 colors with Bengali names)
- Live canvas preview with animated loading
- Download PNG / JPG / PDF (A4)
- Free/Pro toggle (watermark control)
- Floating particle animations
- Tab-based editor (কন্টেন্ট / স্টাইল / সেটিংস tabs)
- OTV logo auto-embedded on all cards
- Dual-photo upload for split templates
- Second headline field for dual/summary templates
- Person Name 2 / Title 2 fields for dual quote cards
- Framer Motion animations throughout

## File Structure
- `client/src/pages/home.tsx` - Main page with premium UI
- `client/src/lib/templates.ts` - 13 template render functions
- `client/src/lib/canvas-utils.ts` - Canvas drawing utilities
- `client/src/App.tsx` - Router setup
- `client/public/images/otv-logo.png` - OTV logo (transparent)
- `attached_assets/otv_1773042288152.jpg` - Original OTV logo

## Fonts
- Noto Sans Bengali (primary Bengali font, Facebook-compatible)
- Hind Siliguri (Bengali fallback)
- Montserrat (Headlines, English text)

## Template IDs
jamuna-dark, national-dark, quote-card, clean-news, dual-quote, world-report, breaking-red, sports-green, opinion-blue, investigation, social-modern, classic-formal, minimal-light, dual-quote-split, grid-highlight, quote-highlight, news-summary

## New Templates (4)
- **dual-quote-split**: Two colored halves (red/green), two people, two quotes, two photos
- **grid-highlight**: Grid background with yellow highlighted text, news photo below
- **quote-highlight**: Big quotemark, highlighter-style text, faded photo
- **news-summary**: Green grid bg, circular photo, bullet highlights

## Canvas Utilities
- `drawGridLines` - Grid line overlay
- `drawHighlightedText` - Yellow-highlighted text blocks
- `drawCircularImage` - Circular photo with border
- `drawOtvWatermark` - OTV logo watermark (used in all templates)

## CardData Interface
headline, headline2, category, viaText, mainPhoto, secondPhoto, channelLogo, otvLogo, personName, personTitle, personName2, personTitle2, highlightColor
