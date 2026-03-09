# BD News Card Maker

## Overview
A premium Bangladeshi TV news-style photo card generator web application. Users can create professional news cards similar to Jamuna TV, Bongo Wiki, Prothom Alo, and DBS News style graphics.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js (minimal, mostly serves static files)
- **Canvas Rendering**: HTML5 Canvas API for client-side card generation
- **PDF Export**: jsPDF library
- **Routing**: wouter

## Key Features
- 13 distinct news card templates (dark, light, quote, sports, breaking, etc.)
- Upload main photo + channel logo (PNG transparency)
- Editable headline (Bangla + English Unicode support)
- Category badge selection (JUSTICE, NATIONAL, WORLD, BREAKING, etc.)
- Via text customization
- Person name/title fields for quote-style cards
- Accent color picker
- Live canvas preview (1200x1200px)
- Download as PNG, JPG, or A4 PDF
- Free/Pro toggle (UI-only, Pro removes watermark)
- Responsive design for mobile and desktop
- Bengali font support (Noto Sans Bengali, Hind Siliguri)
- Templated.io API key placeholder for automation

## File Structure
- `client/src/pages/home.tsx` - Main page with editor UI and preview
- `client/src/lib/templates.ts` - 13 template render functions
- `client/src/lib/canvas-utils.ts` - Canvas drawing utilities
- `client/src/App.tsx` - Router setup

## Fonts
- Noto Sans Bengali (Bengali text)
- Hind Siliguri (Bengali fallback)
- Montserrat (Headlines, English text)
- Open Sans (UI text)

## Template IDs
jamuna-dark, national-dark, quote-card, clean-news, dual-quote, world-report, breaking-red, sports-green, opinion-blue, investigation, social-modern, classic-formal, minimal-light
