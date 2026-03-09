import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { templates, type TemplateConfig } from "@/lib/templates";
import { BANGLA_FONT_OPTIONS } from "@/lib/canvas-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Upload,
  Image as ImageIcon,
  FileImage,
  FileText,
  Crown,
  Sparkles,
  X,
  Check,
  Camera,
  Wand2,
  Settings2,
  Users,
  Move,
  GripVertical,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Copy,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Grid3X3,
  SlidersHorizontal,
  Type,
  Palette,
  Eraser,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Shuffle,
  Trash2,
  Quote,
  List,
  Calendar,
  Highlighter,
  Grid2X2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import otvLogoTransparent from "@assets/otv_1773042288152.jpg";

const otvLogoPath = "/images/otv-logo-transparent.png";

const CATEGORIES = [
  { value: "JUSTICE", bn: "\u09AC\u09BF\u099A\u09BE\u09B0" },
  { value: "NATIONAL", bn: "\u099C\u09BE\u09A4\u09C0\u09AF\u09BC" },
  { value: "WORLD", bn: "\u09AC\u09BF\u09B6\u09CD\u09AC" },
  { value: "BREAKING", bn: "\u09AC\u09CD\u09B0\u09C7\u0995\u09BF\u0982" },
  { value: "SPORTS", bn: "\u0996\u09C7\u09B2\u09BE" },
  { value: "POLITICS", bn: "\u09B0\u09BE\u099C\u09A8\u09C0\u09A4\u09BF" },
  { value: "ENTERTAINMENT", bn: "\u09AC\u09BF\u09A8\u09CB\u09A6\u09A8" },
  { value: "INVESTIGATION", bn: "\u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8" },
  { value: "OPINION", bn: "\u09AE\u09A4\u09BE\u09AE\u09A4" },
  { value: "TRENDING", bn: "\u099F\u09CD\u09B0\u09C7\u09A8\u09CD\u09A1\u09BF\u0982" },
  { value: "CRIME", bn: "\u0985\u09AA\u09B0\u09BE\u09A7" },
  { value: "EDUCATION", bn: "\u09B6\u09BF\u0995\u09CD\u09B7\u09BE" },
];

const ACCENT_COLORS = [
  { color: "#ffc107", bn: "\u09B8\u09CB\u09A8\u09BE\u09B2\u09C0" },
  { color: "#ff6b35", bn: "\u0995\u09AE\u09B2\u09BE" },
  { color: "#ef4444", bn: "\u09B2\u09BE\u09B2" },
  { color: "#22c55e", bn: "\u09B8\u09AC\u09C1\u099C" },
  { color: "#3b82f6", bn: "\u09A8\u09C0\u09B2" },
  { color: "#a855f7", bn: "\u09AC\u09C7\u0997\u09C1\u09A8\u09C0" },
  { color: "#d4af37", bn: "\u0997\u09CB\u09B2\u09CD\u09A1" },
  { color: "#ec4899", bn: "\u0997\u09CB\u09B2\u09BE\u09AA\u09C0" },
  { color: "#06b6d4", bn: "\u09B8\u09BE\u0987\u09A8" },
  { color: "#f97316", bn: "\u0995\u09AE\u09B2\u09BE \u09E8" },
];

const TEMPLATE_CATEGORIES = [
  { id: "all", bn: "\u09B8\u09AC", en: "All" },
  { id: "dark", bn: "\u09A1\u09BE\u09B0\u09CD\u0995", en: "Dark" },
  { id: "light", bn: "\u09B2\u09BE\u0987\u099F", en: "Light" },
  { id: "photo", bn: "\u09AB\u099F\u09CB", en: "Photo" },
  { id: "themed", bn: "\u09A5\u09BF\u09AE\u09A1", en: "Themed" },
  { id: "premium", bn: "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE", en: "Premium" },
];

const DEMO_PRESETS = [
  {
    headline: "\u09B8\u09C1\u09AA\u09CD\u09B0\u09BF\u09AE \u0995\u09CB\u09B0\u09CD\u099F\u09C7\u09B0 \u09B0\u09BE\u09AF\u09BC\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09A8\u09BE",
    subheadline: "\u0986\u0987\u09A8\u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09C0 \u099C\u09BE\u09A8\u09BE\u09B2\u09C7\u09A8 \u09A8\u09A4\u09C1\u09A8 \u09A8\u09C0\u09A4\u09BF\u09AE\u09BE\u09B2\u09BE \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC\u09BE\u09AF\u09BC\u09A8 \u09B9\u09AC\u09C7",
    category: "JUSTICE", viaText: "Via | OTV", accentColor: "#ffc107", templateId: "jamuna-dark",
    bn: "\u09AC\u09BF\u099A\u09BE\u09B0 \u09B8\u0982\u09AC\u09BE\u09A6",
  },
  {
    headline: "\u09A2\u09BE\u0995\u09BE\u09AF\u09BC \u09AC\u09BF\u09B6\u09BE\u09B2 \u099C\u09A8\u09B8\u09AD\u09BE\u09AF\u09BC \u09A8\u09A4\u09C1\u09A8 \u09A6\u09B2 \u0998\u09CB\u09B7\u09A3\u09BE",
    subheadline: "\u09B0\u09BE\u099C\u09A8\u09C8\u09A4\u09BF\u0995 \u09AA\u09B0\u09BF\u09B8\u09CD\u09A5\u09BF\u09A4\u09BF\u09A4\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AE\u09CB\u09DC \u09A8\u09C7\u09AF\u09BC\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF",
    category: "POLITICS", viaText: "Via | OTV", accentColor: "#ef4444", templateId: "breaking-red",
    bn: "\u09B0\u09BE\u099C\u09A8\u09C0\u09A4\u09BF",
  },
  {
    headline: "\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6 \u0995\u09CD\u09B0\u09BF\u0995\u09C7\u099F \u09A6\u09B2 \u099F\u09C7\u09B8\u09CD\u099F \u09B8\u09BF\u09B0\u09BF\u099C\u09C7 \u09AC\u09DC \u099C\u09AF\u09BC",
    subheadline: "\u09B8\u09BE\u0995\u09BF\u09AC \u09B0\u09B9\u09AE\u09BE\u09A8\u09C7\u09B0 \u0985\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09B8\u09C7\u099E\u09CD\u099A\u09C1\u09B0\u09BF\u09A4\u09C7 \u099C\u09AF\u09BC",
    category: "SPORTS", viaText: "Via | OTV", accentColor: "#22c55e", templateId: "sports-green",
    bn: "\u0996\u09C7\u09B2\u09BE",
  },
  {
    headline: "\u0997\u09A3\u09A4\u09A8\u09CD\u09A4\u09CD\u09B0\u09C7\u09B0 \u09AD\u09AC\u09BF\u09B7\u09CD\u09AF\u09CE \u09A8\u09BF\u09B0\u09CD\u09AD\u09B0 \u0995\u09B0\u09AC\u09C7 \u099C\u09A8\u0997\u09A3",
    subheadline: "",
    quoteText: "\u0986\u09AE\u09B0\u09BE \u099C\u09A8\u0997\u09A3\u09C7\u09B0 \u0985\u09A7\u09BF\u0995\u09BE\u09B0\u09C7 \u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8 \u0995\u09B0\u09BF, \u099C\u09A8\u09AE\u09A4\u0987 \u09B6\u0995\u09CD\u09A4\u09BF",
    personName: "\u09B0\u09BE\u099C\u09A8\u09C8\u09A4\u09BF\u0995 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u0995",
    personTitle: "\u09B0\u09BE\u099C\u09A8\u09C0\u09A4\u09BF \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u0995",
    category: "OPINION", viaText: "Via | OTV", accentColor: "#d4af37", templateId: "quote-card",
    bn: "\u09AE\u09A4\u09BE\u09AE\u09A4",
  },
  {
    headline: "\u0986\u0987\u099F\u09BF \u0996\u09BE\u09A4\u09C7 \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u09A8\u09A4\u09C1\u09A8 \u09B8\u09AB\u09B2\u09A4\u09BE",
    subheadline: "\u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6 \u09AA\u09CD\u09B0\u0995\u09B2\u09CD\u09AA\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AE\u09BE\u0987\u09B2\u09AB\u09B2\u0995",
    category: "TRENDING", viaText: "Via | OTV", accentColor: "#3b82f6", templateId: "clean-news",
    bn: "\u099F\u09CD\u09B0\u09C7\u09A8\u09CD\u09A1\u09BF\u0982",
  },
  {
    headline: "\u09B0\u09BE\u099C\u09A7\u09BE\u09A8\u09C0\u09A4\u09C7 \u09A1\u09BE\u0995\u09BE\u09A4\u09BF \u09AE\u09BE\u09AE\u09B2\u09BE\u09AF\u09BC \u09E9 \u099C\u09A8 \u0997\u09CD\u09B0\u09C7\u09AA\u09CD\u09A4\u09BE\u09B0",
    subheadline: "\u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u09AC\u09BF\u09AD\u09BE\u0997 \u09A4\u09A6\u09A8\u09CD\u09A4 \u099A\u09BE\u09B2\u09BF\u09AF\u09BC\u09C7 \u09AF\u09BE\u099A\u09CD\u099B\u09C7",
    category: "CRIME", viaText: "Via | OTV", accentColor: "#ef4444", templateId: "investigation",
    bn: "\u0985\u09AA\u09B0\u09BE\u09A7",
  },
  {
    headline: "\u0985\u09B0\u09CD\u09A5\u09A8\u09C0\u09A4\u09BF\u09A4\u09C7 \u09A8\u09A4\u09C1\u09A8 \u0997\u09A4\u09BF \u2014 \u099C\u09BF\u09A1\u09BF\u09AA\u09BF \u09AC\u09BE\u09DC\u099B\u09C7",
    subheadline: "\u09AC\u09BF\u09B6\u09CD\u09AC\u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8\u09C7 \u09B8\u0995\u09BE\u09B0\u09BE\u09A4\u09CD\u09AE\u0995 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8",
    category: "NATIONAL", viaText: "Via | OTV", accentColor: "#d4af37", templateId: "national-dark",
    bn: "\u0985\u09B0\u09CD\u09A5\u09A8\u09C0\u09A4\u09BF",
  },
  {
    headline: "\u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AD\u09C1\u09AF\u09BC\u09BE \u0996\u09AC\u09B0\u09C7\u09B0 \u09AC\u09BF\u09B0\u09C1\u09A6\u09CD\u09A7\u09C7 \u09B8\u099A\u09C7\u09A4\u09A8\u09A4\u09BE",
    subheadline: "\u09B8\u09A0\u09BF\u0995 \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC \u09AC\u09CB\u099D\u09BE\u09A4\u09C7 \u09A8\u09A4\u09C1\u09A8 \u0995\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09C7\u0987\u09A8",
    category: "TRENDING", viaText: "Via | OTV", accentColor: "#a855f7", templateId: "social-modern",
    bn: "\u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995",
  },
];

const COLOR_PRESETS = [
  { id: "aurora-glass", name: "Aurora Glass", nameBn: "\u0985\u09B0\u09CB\u09B0\u09BE \u0997\u09CD\u09B2\u09BE\u09B8", colors: ["#00d2ff", "#7b2ff7", "#ff6bca"], accent: "#7b2ff7" },
  { id: "neon-ice", name: "Neon Ice", nameBn: "\u09A8\u09BF\u09AF\u09BC\u09A8 \u0986\u0987\u09B8", colors: ["#00f5ff", "#00b4d8", "#0077b6"], accent: "#00f5ff" },
  { id: "royal-purple", name: "Royal Purple", nameBn: "\u09B0\u09AF\u09BC\u09BE\u09B2 \u09AA\u09BE\u09B0\u09CD\u09AA\u09B2", colors: ["#6a0dad", "#9b59b6", "#c39bd3"], accent: "#9b59b6" },
  { id: "sunset-glow", name: "Sunset Glow", nameBn: "\u09B8\u09BE\u09A8\u09B8\u09C7\u099F \u0997\u09CD\u09B2\u09CB", colors: ["#ff6b35", "#ff8c42", "#ffd700"], accent: "#ff6b35" },
  { id: "premium-gold", name: "Premium Gold", nameBn: "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0997\u09CB\u09B2\u09CD\u09A1", colors: ["#d4af37", "#f5e6a3", "#b8860b"], accent: "#d4af37" },
  { id: "emerald-crystal", name: "Emerald Crystal", nameBn: "\u098F\u09AE\u09C7\u09B0\u09BE\u09B2\u09CD\u09A1 \u0995\u09CD\u09B0\u09BF\u09B8\u09CD\u099F\u09BE\u09B2", colors: ["#00c853", "#2ecc71", "#1abc9c"], accent: "#00c853" },
  { id: "candy-glass", name: "Candy Glass", nameBn: "\u0995\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09BF \u0997\u09CD\u09B2\u09BE\u09B8", colors: ["#ff6bcb", "#ff9a9e", "#fecfef"], accent: "#ff6bcb" },
  { id: "editorial-frost", name: "Editorial Frost", nameBn: "\u098F\u09A1\u09BF\u099F\u09CB\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2 \u09AB\u09CD\u09B0\u09B8\u09CD\u099F", colors: ["#e0e0e0", "#f5f5f5", "#bdbdbd", "#9e9e9e"], accent: "#757575" },
  { id: "dark-luxe", name: "Dark Luxe", nameBn: "\u09A1\u09BE\u09B0\u09CD\u0995 \u09B2\u09BE\u0995\u09CD\u09B8", colors: ["#1a1a2e", "#16213e", "#0f3460"], accent: "#e94560" },
  { id: "rainbow-prism", name: "Rainbow Prism", nameBn: "\u09B0\u09C7\u0987\u09A8\u09AC\u09CB \u09AA\u09CD\u09B0\u09BF\u099C\u09AE", colors: ["#ff0000", "#ff8c00", "#ffff00", "#00ff00", "#0000ff", "#8b00ff"], accent: "#ff8c00" },
];

const BG_PRESETS = [
  { id: "aurora-glow", name: "Aurora Glow", nameBn: "\u0985\u09B0\u09CB\u09B0\u09BE \u0997\u09CD\u09B2\u09CB", gradientStops: ["#0a0020", "#1a0040", "#003060"], glowColors: ["rgba(0,210,255,0.15)", "rgba(123,47,247,0.12)"] },
  { id: "crystal-blue", name: "Crystal Blue", nameBn: "\u0995\u09CD\u09B0\u09BF\u09B8\u09CD\u099F\u09BE\u09B2 \u09AC\u09CD\u09B2\u09C1", gradientStops: ["#001529", "#002244", "#003366"], glowColors: ["rgba(0,180,216,0.15)", "rgba(0,119,182,0.1)"] },
  { id: "luxury-violet", name: "Luxury Violet", nameBn: "\u09B2\u09BE\u0995\u09CD\u09B8\u09BE\u09B0\u09BF \u09AD\u09BE\u09AF\u09BC\u09CB\u09B2\u09C7\u099F", gradientStops: ["#0d001a", "#1a0033", "#2d004d"], glowColors: ["rgba(155,89,182,0.15)", "rgba(106,13,173,0.1)"] },
  { id: "sunset-bloom", name: "Sunset Bloom", nameBn: "\u09B8\u09BE\u09A8\u09B8\u09C7\u099F \u09AC\u09CD\u09B2\u09C1\u09AE", gradientStops: ["#1a0500", "#2d0a00", "#401500"], glowColors: ["rgba(255,107,53,0.12)", "rgba(255,215,0,0.1)"] },
  { id: "gold-shine", name: "Gold Shine", nameBn: "\u0997\u09CB\u09B2\u09CD\u09A1 \u09B6\u09BE\u0987\u09A8", gradientStops: ["#1a1200", "#2d1f00", "#403000"], glowColors: ["rgba(212,175,55,0.15)", "rgba(245,230,163,0.08)"] },
  { id: "emerald-haze", name: "Emerald Haze", nameBn: "\u098F\u09AE\u09C7\u09B0\u09BE\u09B2\u09CD\u09A1 \u09B9\u09C7\u099C", gradientStops: ["#001a0d", "#002d1a", "#004d2e"], glowColors: ["rgba(0,200,83,0.12)", "rgba(26,188,156,0.1)"] },
  { id: "midnight-glass", name: "Midnight Glass", nameBn: "\u09AE\u09BF\u09A1\u09A8\u09BE\u0987\u099F \u0997\u09CD\u09B2\u09BE\u09B8", gradientStops: ["#0a0a1a", "#0f0f2e", "#141442"], glowColors: ["rgba(100,100,200,0.1)", "rgba(60,60,150,0.08)"] },
  { id: "rainbow-prism-bg", name: "Rainbow Prism", nameBn: "\u09B0\u09C7\u0987\u09A8\u09AC\u09CB \u09AA\u09CD\u09B0\u09BF\u099C\u09AE", gradientStops: ["#0a001a", "#001a2e", "#001a0d"], glowColors: ["rgba(255,0,100,0.08)", "rgba(0,100,255,0.08)", "rgba(0,255,100,0.06)"] },
  { id: "white-frost", name: "White Frost", nameBn: "\u09B9\u09CB\u09AF\u09BC\u09BE\u0987\u099F \u09AB\u09CD\u09B0\u09B8\u09CD\u099F", gradientStops: ["#f0f0f5", "#e8e8f0", "#dddde8"], glowColors: ["rgba(200,200,220,0.2)", "rgba(180,180,200,0.15)"] },
  { id: "dark-editorial", name: "Dark Editorial", nameBn: "\u09A1\u09BE\u09B0\u09CD\u0995 \u098F\u09A1\u09BF\u099F\u09CB\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2", gradientStops: ["#0a0a0a", "#141414", "#1e1e1e"], glowColors: ["rgba(255,255,255,0.03)", "rgba(200,200,200,0.02)"] },
];

const GLASS_STYLES = [
  { id: "clear-premium", name: "Clear Premium", nameBn: "\u0995\u09CD\u09B2\u09BF\u09AF\u09BC\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE", bgOpacity: 0.15, blurLevel: 20, edgeColor: "rgba(255,255,255,0.3)" },
  { id: "frosted-white", name: "Frosted White", nameBn: "\u09AB\u09CD\u09B0\u09B8\u09CD\u099F\u09C7\u09A1 \u09B9\u09CB\u09AF\u09BC\u09BE\u0987\u099F", bgOpacity: 0.25, blurLevel: 30, edgeColor: "rgba(255,255,255,0.5)" },
  { id: "dark-smoked", name: "Dark Smoked", nameBn: "\u09A1\u09BE\u09B0\u09CD\u0995 \u09B8\u09CD\u09AE\u09CB\u0995\u09A1", bgOpacity: 0.4, blurLevel: 25, edgeColor: "rgba(255,255,255,0.15)" },
  { id: "colorful-neon", name: "Colorful Neon", nameBn: "\u0995\u09BE\u09B2\u09BE\u09B0\u09AB\u09C1\u09B2 \u09A8\u09BF\u09AF\u09BC\u09A8", bgOpacity: 0.2, blurLevel: 18, edgeColor: "rgba(0,255,200,0.4)" },
  { id: "luxury-gradient", name: "Luxury Gradient", nameBn: "\u09B2\u09BE\u0995\u09CD\u09B8\u09BE\u09B0\u09BF \u0997\u09CD\u09B0\u09C7\u09A1\u09BF\u09AF\u09BC\u09C7\u09A8\u09CD\u099F", bgOpacity: 0.3, blurLevel: 22, edgeColor: "rgba(212,175,55,0.35)" },
  { id: "soft-pastel", name: "Soft Pastel", nameBn: "\u09B8\u09AB\u09CD\u099F \u09AA\u09CD\u09AF\u09BE\u09B8\u09CD\u099F\u09C7\u09B2", bgOpacity: 0.2, blurLevel: 28, edgeColor: "rgba(255,182,193,0.35)" },
  { id: "editorial-panel", name: "Editorial Panel", nameBn: "\u098F\u09A1\u09BF\u099F\u09CB\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2 \u09AA\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2", bgOpacity: 0.35, blurLevel: 15, edgeColor: "rgba(200,200,200,0.25)" },
  { id: "crystal-card", name: "Crystal Card", nameBn: "\u0995\u09CD\u09B0\u09BF\u09B8\u09CD\u099F\u09BE\u09B2 \u0995\u09BE\u09B0\u09CD\u09A1", bgOpacity: 0.1, blurLevel: 35, edgeColor: "rgba(255,255,255,0.45)" },
];

const DECOR_PRESET_OPTIONS = [
  { id: "sparkle", name: "Sparkle", nameBn: "\u09B8\u09CD\u09AA\u09BE\u09B0\u09CD\u0995\u09B2" },
  { id: "breaking", name: "Breaking", nameBn: "\u09AC\u09CD\u09B0\u09C7\u0995\u09BF\u0982" },
  { id: "social", name: "Social", nameBn: "\u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2" },
  { id: "cute", name: "Cute", nameBn: "\u0995\u09BF\u0989\u099F" },
  { id: "editorial", name: "Editorial", nameBn: "\u098F\u09A1\u09BF\u099F\u09CB\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2" },
  { id: "futuristic", name: "Futuristic", nameBn: "\u09AB\u09BF\u0989\u099A\u09BE\u09B0\u09BF\u09B8\u09CD\u099F\u09BF\u0995" },
  { id: "neon", name: "Neon", nameBn: "\u09A8\u09BF\u09AF\u09BC\u09A8" },
  { id: "celebration", name: "Celebration", nameBn: "\u0989\u09CE\u09B8\u09AC" },
  { id: "royal", name: "Royal", nameBn: "\u09B0\u09AF\u09BC\u09C7\u09B2" },
  { id: "love", name: "Love", nameBn: "\u09B2\u09BE\u09AD" },
];

const CANVAS_SIZE = 1200;
const BN = "'Noto Sans Bengali', 'Hind Siliguri', sans-serif";
const DUAL_TEMPLATES = ["dual-quote", "dual-quote-split"];

const G = {
  bg1: "#080c1a",
  bg2: "#0d1228",
  bg3: "#070a18",
  panel: "rgba(255,255,255,0.055)",
  panelBorder: "rgba(255,255,255,0.10)",
  panelActive: "rgba(255,255,255,0.10)",
  input: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(255,255,255,0.12)",
  inputFocus: "rgba(130,120,255,0.35)",
  gold: "#f0c040",
  goldLight: "#f8d060",
  goldDim: "rgba(240,192,64,0.15)",
  blur: "blur(40px) saturate(180%)",
  blurSm: "blur(20px) saturate(160%)",
  r: "18px",
  rSm: "12px",
  rXl: "24px",
  headerBg: "rgba(8,12,26,0.85)",
  accent: "rgba(120,100,255,0.15)",
  accentBorder: "rgba(140,120,255,0.28)",
  glassGradient: "linear-gradient(135deg, rgba(120,100,255,0.10), rgba(180,140,255,0.07), rgba(80,160,255,0.05))",
  glassHighlight: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.02)",
  iridescent: "linear-gradient(135deg, #f0c040, #c080ff, #60a8ff, #f0c040)",
  iridescentHover: "linear-gradient(135deg, #f8d060, #d090ff, #80bcff, #f8d060)",
  shimmer: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
};

const OTV_LOGO_DEFAULT_SIZE = 100;

function getTemplateCategory(id: string): string {
  const darkIds = ["jamuna-dark", "national-dark", "world-report", "breaking-red", "sports-green", "opinion-blue", "investigation", "classic-formal", "crimson-dark", "midnight-blue", "forest-dark", "sunset-orange", "purple-haze", "neon-cyan", "rose-gold", "steel-gray", "emerald-night", "coral-dark"];
  const lightIds = ["quote-card", "clean-news", "minimal-light", "grid-highlight", "quote-highlight", "news-summary", "pastel-pink", "ivory-clean", "sage-green", "sky-blue", "lavender-light", "peach-warm", "mint-fresh", "cream-classic", "sand-warm", "snow-white"];
  const photoIds = ["social-modern", "photo-full-overlay", "photo-blur-bg", "photo-cinematic", "photo-magazine", "photo-editorial", "photo-portrait", "photo-panorama", "photo-vignette", "photo-duotone", "photo-vintage", "photo-breaking-ticker", "photo-left-panel", "photo-cinematic-dark", "photo-magazine-cover", "photo-news-card", "photo-split-gradient", "photo-top-banner", "photo-vignette-text"];
  const themedIds = ["dual-quote", "dual-quote-split", "ramadan-green", "eid-gold", "victory-red", "independence-green", "election-blue", "weather-cyan", "health-green", "tech-blue", "economy-gold", "education-purple"];
  if (darkIds.includes(id)) return "dark";
  if (lightIds.includes(id)) return "light";
  if (photoIds.includes(id)) return "photo";
  if (themedIds.includes(id)) return "themed";
  return "premium";
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: G.panel, border: `1px solid ${G.panelBorder}`, borderRadius: G.r, backdropFilter: G.blurSm, boxShadow: "0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4" data-testid={`section-toggle-${title}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(140,130,255,0.25), rgba(100,170,255,0.18))", border: `1px solid ${G.accentBorder}`, boxShadow: "0 2px 8px rgba(120,110,255,0.15)" }}>
            <Icon className="w-5 h-5 text-indigo-300" />
          </div>
          <span className="text-base font-bold text-white/85">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-white/55" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(templates[0]);
  const [headline, setHeadline] = useState("\u099C\u09BE\u099F\u09CD\u09B0\u09BE\u09AC\u09BE\u09DC\u09C0\u09A4\u09C7 \u09E8\u09E6\u099F\u09BF \u0995\u09C1\u0995\u09C1\u09B0 \u09B9\u09A4\u09CD\u09AF\u09BE\u09B0 \u0998\u099F\u09A8\u09BE\u09AF\u09BC \u09E9 \u099C\u09A8\u09C7\u09B0 \u09E8.\u09EB \u09AC\u099B\u09B0\u09C7\u09B0 \u099C\u09C7\u09B2");
  const [headline2, setHeadline2] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [bulletText, setBulletText] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [dateText, setDateText] = useState("");
  const [category, setCategory] = useState("JUSTICE");
  const [viaText, setViaText] = useState("Via | OTV");
  const [personName, setPersonName] = useState("");
  const [personTitle, setPersonTitle] = useState("");
  const [personName2, setPersonName2] = useState("");
  const [personTitle2, setPersonTitle2] = useState("");
  const [highlightColor, setHighlightColor] = useState("#ffc107");
  const [highlightWords, setHighlightWords] = useState("");
  const [mainPhotoSrc, setMainPhotoSrc] = useState<string | null>(null);
  const [mainPhotoImg, setMainPhotoImg] = useState<HTMLImageElement | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [secondPhotoSrc, setSecondPhotoSrc] = useState<string | null>(null);
  const [secondPhotoImg, setSecondPhotoImg] = useState<HTMLImageElement | null>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [otvLogoImg, setOtvLogoImg] = useState<HTMLImageElement | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [activeSection, setActiveSection] = useState<"content" | "style" | "settings">("content");
  const [otvLogoX, setOtvLogoX] = useState(CANVAS_SIZE / 2);
  const [otvLogoY, setOtvLogoY] = useState(CANVAS_SIZE - 60);
  const [otvLogoSize, setOtvLogoSize] = useState(OTV_LOGO_DEFAULT_SIZE);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragMode, setDragMode] = useState<"logo" | "image">("logo");
  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [showTemplateGrid, setShowTemplateGrid] = useState(false);
  const [selectedBanglaFont, setSelectedBanglaFont] = useState<(typeof BANGLA_FONT_OPTIONS)[number]>(BANGLA_FONT_OPTIONS[0]);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [gridEnabled, setGridEnabled] = useState(false);
  const [grainEnabled, setGrainEnabled] = useState(false);
  const [textureEnabled, setTextureEnabled] = useState(false);
  const [gridIntensity, setGridIntensity] = useState(0.5);
  const [grainIntensity, setGrainIntensity] = useState(0.5);
  const [exportSize, setExportSize] = useState(1200);
  const [selectedColorPreset, setSelectedColorPreset] = useState<typeof COLOR_PRESETS[number] | null>(null);
  const [selectedBgPreset, setSelectedBgPreset] = useState<typeof BG_PRESETS[number] | null>(null);
  const [selectedGlassStyle, setSelectedGlassStyle] = useState<typeof GLASS_STYLES[number] | null>(null);
  const [autoDecorate, setAutoDecorate] = useState(false);
  const [decorPreset, setDecorPreset] = useState("sparkle");
  const [emojiDensity, setEmojiDensity] = useState(0.5);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [blurIntensity, setBlurIntensity] = useState(0.5);
  const [transparencyLevel, setTransparencyLevel] = useState(0.5);
  const [cornerRadius, setCornerRadius] = useState(20);
  const [headlineColor, setHeadlineColor] = useState("#ffffff");
  const [subheadlineColor, setSubheadlineColor] = useState("#cccccc");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [sourceTextColor, setSourceTextColor] = useState("#aaaaaa");
  const [badgeColor, setBadgeColor] = useState("#ffffff");
  const [glassTintColor, setGlassTintColor] = useState("rgba(255,255,255,0.08)");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const secondPhotoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const isDual = DUAL_TEMPLATES.includes(selectedTemplate.id);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    if (templateFilter !== "all") {
      filtered = filtered.filter(t => getTemplateCategory(t.id) === templateFilter);
    }
    if (templateSearch.trim()) {
      const q = templateSearch.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.nameBn.includes(q) || t.id.includes(q));
    }
    return filtered;
  }, [templateFilter, templateSearch]);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  const loadImg = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  useEffect(() => {
    loadImg(otvLogoPath).then(setOtvLogoImg).catch(() => {
      loadImg(otvLogoTransparent).then(setOtvLogoImg).catch(() => {});
    });
  }, [loadImg]);

  const handleRemoveBg = useCallback(async () => {
    if (!mainPhotoSrc || isRemovingBg) return;
    setIsRemovingBg(true);
    try {
      const response = await fetch(mainPhotoSrc);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, "photo.png");
      const apiRes = await fetch("/api/remove-bg", { method: "POST", body: formData });
      if (!apiRes.ok) {
        const errData = await apiRes.json();
        throw new Error(errData.error || "Background removal failed");
      }
      const data = await apiRes.json();
      if (data.image) {
        if (mainPhotoSrc) URL.revokeObjectURL(mainPhotoSrc);
        const newImg = new Image();
        newImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          newImg.onload = () => resolve();
          newImg.onerror = reject;
          newImg.src = data.image;
        });
        setMainPhotoSrc(data.image);
        setMainPhotoImg(newImg);
        setIsGenerated(false);
      }
    } catch (err: any) {
      console.error("BG removal error:", err);
      alert(err.message || "Background removal failed. Please try again.");
    } finally {
      setIsRemovingBg(false);
    }
  }, [mainPhotoSrc, isRemovingBg]);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mainPhotoSrc) URL.revokeObjectURL(mainPhotoSrc);
    const url = URL.createObjectURL(file);
    setMainPhotoSrc(url);
    setMainPhotoImg(await loadImg(url));
    setImageOffsetX(0);
    setImageOffsetY(0);
    setImageZoom(1);
    setIsGenerated(false);
  }, [loadImg, mainPhotoSrc]);

  const handleSecondPhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (secondPhotoSrc) URL.revokeObjectURL(secondPhotoSrc);
    const url = URL.createObjectURL(file);
    setSecondPhotoSrc(url);
    setSecondPhotoImg(await loadImg(url));
    setIsGenerated(false);
  }, [loadImg, secondPhotoSrc]);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoSrc) URL.revokeObjectURL(logoSrc);
    const url = URL.createObjectURL(file);
    setLogoSrc(url);
    setLogoImg(await loadImg(url));
    setIsGenerated(false);
  }, [loadImg, logoSrc]);

  const renderCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    selectedTemplate.render(ctx, {
      headline, headline2, subheadline, bulletText, quoteText, dateText,
      category, viaText,
      mainPhoto: mainPhotoImg, secondPhoto: secondPhotoImg,
      channelLogo: logoImg, otvLogo: otvLogoImg,
      personName, personTitle, personName2, personTitle2, highlightColor,
      highlightWords,
      otvLogoX, otvLogoY, otvLogoSize,
      imageOffsetX, imageOffsetY, imageZoom,
      banglaFont: selectedBanglaFont.family,
      headlineFont: `${selectedBanglaFont.family.split(",")[0]}, "Montserrat", "Noto Sans Bengali", "Hind Siliguri", sans-serif`,
      gridEnabled, grainEnabled, textureEnabled,
      gridIntensity, grainIntensity,
      textAlign,
      exportSize,
      colorPreset: selectedColorPreset ? { id: selectedColorPreset.id, name: selectedColorPreset.name, colors: selectedColorPreset.colors, accent: selectedColorPreset.accent } : undefined,
      bgPreset: selectedBgPreset ? { id: selectedBgPreset.id, name: selectedBgPreset.name, gradientStops: selectedBgPreset.gradientStops, glowColors: selectedBgPreset.glowColors } : undefined,
      glassStyle: selectedGlassStyle ? { id: selectedGlassStyle.id, name: selectedGlassStyle.name, bgOpacity: selectedGlassStyle.bgOpacity, blurLevel: selectedGlassStyle.blurLevel, edgeColor: selectedGlassStyle.edgeColor } : undefined,
      autoDecorate,
      decorPreset,
      emojiDensity,
      glowIntensity,
      blurIntensity,
      transparencyLevel,
      cornerRadius,
      headlineColor: headlineColor !== "#ffffff" ? headlineColor : undefined,
      subheadlineColor: subheadlineColor !== "#cccccc" ? subheadlineColor : undefined,
      labelColor: labelColor !== "#ffffff" ? labelColor : undefined,
      sourceTextColor: sourceTextColor !== "#aaaaaa" ? sourceTextColor : undefined,
      badgeColor: badgeColor !== "#ffffff" ? badgeColor : undefined,
      glassTintColor: glassTintColor !== "rgba(255,255,255,0.08)" ? glassTintColor : undefined,
    }, CANVAS_SIZE, CANVAS_SIZE);
    if (!isPro) {
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.font = '700 42px "Montserrat", sans-serif';
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText("OTV.ONLINE", 0, 0);
      ctx.restore();
    }
  }, [headline, headline2, subheadline, bulletText, quoteText, dateText, category, viaText, mainPhotoImg, secondPhotoImg, logoImg, otvLogoImg, selectedTemplate, isPro, personName, personTitle, personName2, personTitle2, highlightColor, highlightWords, otvLogoX, otvLogoY, otvLogoSize, imageOffsetX, imageOffsetY, imageZoom, selectedBanglaFont, gridEnabled, grainEnabled, textureEnabled, gridIntensity, grainIntensity, textAlign, exportSize, selectedColorPreset, selectedBgPreset, selectedGlassStyle, autoDecorate, decorPreset, emojiDensity, glowIntensity, blurIntensity, transparencyLevel, cornerRadius, headlineColor, subheadlineColor, labelColor, sourceTextColor, badgeColor, glassTintColor]);

  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!fontsReady) return;
    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    renderTimerRef.current = setTimeout(() => renderCard(), 150);
    return () => { if (renderTimerRef.current) clearTimeout(renderTimerRef.current); };
  }, [renderCard, fontsReady]);

  const generatePremiumCard = useCallback(() => {
    setIsGenerating(true);
    setIsGenerated(false);
    const timer = setTimeout(() => { renderCard(); setIsGenerated(true); setIsGenerating(false); }, 900);
    return () => clearTimeout(timer);
  }, [renderCard]);

  const downloadPNG = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const slug = headline.replace(/[^\u0980-\u09FF\w\s]/g, "").trim().substring(0, 30).replace(/\s+/g, "-") || "card";
    if (exportSize !== CANVAS_SIZE) {
      const tmp = document.createElement("canvas");
      tmp.width = exportSize; tmp.height = exportSize;
      const tCtx = tmp.getContext("2d");
      if (tCtx) { tCtx.drawImage(c, 0, 0, exportSize, exportSize); }
      const a = document.createElement("a"); a.download = `otv-${slug}-${exportSize}.png`; a.href = tmp.toDataURL("image/png"); a.click();
    } else {
      const a = document.createElement("a"); a.download = `otv-${slug}.png`; a.href = c.toDataURL("image/png"); a.click();
    }
  }, [exportSize, headline]);

  const getExportCanvas = useCallback(() => {
    const c = canvasRef.current; if (!c) return null;
    if (exportSize !== CANVAS_SIZE) {
      const tmp = document.createElement("canvas");
      tmp.width = exportSize; tmp.height = exportSize;
      const tCtx = tmp.getContext("2d");
      if (tCtx) tCtx.drawImage(c, 0, 0, exportSize, exportSize);
      return tmp;
    }
    return c;
  }, [exportSize]);

  const downloadJPG = useCallback(() => {
    const c = getExportCanvas(); if (!c) return;
    const slug = headline.replace(/[^\u0980-\u09FF\w\s]/g, "").trim().substring(0, 30).replace(/\s+/g, "-") || "card";
    const a = document.createElement("a"); a.download = `otv-${slug}-${exportSize}.jpg`; a.href = c.toDataURL("image/jpeg", 0.95); a.click();
  }, [headline, exportSize, getExportCanvas]);

  const downloadPDF = useCallback(async () => {
    const c = getExportCanvas(); if (!c) return;
    const { jsPDF } = await import("jspdf");
    const d = c.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const s = Math.min(pw - 20, ph - 20);
    pdf.addImage(d, "PNG", (pw - s) / 2, (ph - s) / 2, s, s);
    pdf.save(`otv-card-${Date.now()}.pdf`);
  }, [getExportCanvas]);

  const copyToClipboard = useCallback(async () => {
    const c = canvasRef.current; if (!c) return;
    try {
      const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
      if (blob) await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch (_) {}
  }, []);

  const resetAll = useCallback(() => {
    setHeadline("");
    setHeadline2("");
    setSubheadline("");
    setBulletText("");
    setQuoteText("");
    setDateText("");
    setPersonName("");
    setPersonTitle("");
    setPersonName2("");
    setPersonTitle2("");
    setHighlightWords("");
    setGridEnabled(false);
    setGrainEnabled(false);
    setTextureEnabled(false);
    setImageOffsetX(0);
    setImageOffsetY(0);
    setImageZoom(1);
    setOtvLogoX(CANVAS_SIZE / 2);
    setOtvLogoY(CANVAS_SIZE - 60);
    setOtvLogoSize(OTV_LOGO_DEFAULT_SIZE);
    setSelectedColorPreset(null);
    setSelectedBgPreset(null);
    setSelectedGlassStyle(null);
    setIsGenerated(false);
  }, []);

  const loadPreset = useCallback((preset: typeof DEMO_PRESETS[0]) => {
    setHeadline(preset.headline);
    setSubheadline(preset.subheadline || "");
    setCategory(preset.category);
    setViaText(preset.viaText);
    setHighlightColor(preset.accentColor);
    if ((preset as any).quoteText) setQuoteText((preset as any).quoteText);
    if ((preset as any).personName) setPersonName((preset as any).personName);
    if ((preset as any).personTitle) setPersonTitle((preset as any).personTitle);
    const tmpl = templates.find(t => t.id === preset.templateId);
    if (tmpl) { setSelectedTemplate(tmpl); setCategory(tmpl.defaultCategory || preset.category); }
    setIsGenerated(false);
  }, []);

  const loadRandomPreset = useCallback(() => {
    const p = DEMO_PRESETS[Math.floor(Math.random() * DEMO_PRESETS.length)];
    loadPreset(p);
  }, [loadPreset]);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!previewRef.current) return null;
    const rect = previewRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (clientY - rect.top) * (CANVAS_SIZE / rect.height),
    };
  }, []);

  const isNearLogo = useCallback((cx: number, cy: number) => {
    const pad = 30;
    const half = otvLogoSize / 2;
    return cx >= otvLogoX - half - pad && cx <= otvLogoX + half + pad &&
           cy >= otvLogoY - half - pad && cy <= otvLogoY + half + pad;
  }, [otvLogoX, otvLogoY, otvLogoSize]);

  const handlePreviewMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const pt = getCanvasCoords(e.clientX, e.clientY);
    if (!pt) return;
    if (dragMode === "logo" && isNearLogo(pt.x, pt.y)) {
      setIsDraggingLogo(true);
    } else if (dragMode === "image" && mainPhotoImg) {
      setIsDraggingImage(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY, ox: imageOffsetX, oy: imageOffsetY };
    }
  }, [dragMode, isNearLogo, getCanvasCoords, mainPhotoImg, imageOffsetX, imageOffsetY]);

  const handlePreviewMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingLogo && previewRef.current) {
      const pt = getCanvasCoords(e.clientX, e.clientY);
      if (pt) {
        setOtvLogoX(Math.max(0, Math.min(CANVAS_SIZE, pt.x)));
        setOtvLogoY(Math.max(0, Math.min(CANVAS_SIZE, pt.y)));
      }
    } else if (isDraggingImage && dragStartRef.current && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const scale = CANVAS_SIZE / rect.width;
      const dx = (e.clientX - dragStartRef.current.x) * scale;
      const dy = (e.clientY - dragStartRef.current.y) * scale;
      setImageOffsetX(dragStartRef.current.ox + dx);
      setImageOffsetY(dragStartRef.current.oy + dy);
    }
  }, [isDraggingLogo, isDraggingImage, getCanvasCoords]);

  const handlePreviewMouseUp = useCallback(() => {
    setIsDraggingLogo(false);
    setIsDraggingImage(false);
    dragStartRef.current = null;
  }, []);

  const handlePreviewTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const pt = getCanvasCoords(touch.clientX, touch.clientY);
    if (!pt) return;
    if (dragMode === "logo" && isNearLogo(pt.x, pt.y)) {
      setIsDraggingLogo(true);
      e.preventDefault();
    } else if (dragMode === "image" && mainPhotoImg) {
      setIsDraggingImage(true);
      dragStartRef.current = { x: touch.clientX, y: touch.clientY, ox: imageOffsetX, oy: imageOffsetY };
      e.preventDefault();
    }
  }, [dragMode, isNearLogo, getCanvasCoords, mainPhotoImg, imageOffsetX, imageOffsetY]);

  const handlePreviewTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1 || !previewRef.current) return;
    const touch = e.touches[0];
    if (isDraggingLogo) {
      e.preventDefault();
      const pt = getCanvasCoords(touch.clientX, touch.clientY);
      if (pt) {
        setOtvLogoX(Math.max(0, Math.min(CANVAS_SIZE, pt.x)));
        setOtvLogoY(Math.max(0, Math.min(CANVAS_SIZE, pt.y)));
      }
    } else if (isDraggingImage && dragStartRef.current) {
      e.preventDefault();
      const rect = previewRef.current.getBoundingClientRect();
      const scale = CANVAS_SIZE / rect.width;
      const dx = (touch.clientX - dragStartRef.current.x) * scale;
      const dy = (touch.clientY - dragStartRef.current.y) * scale;
      setImageOffsetX(dragStartRef.current.ox + dx);
      setImageOffsetY(dragStartRef.current.oy + dy);
    }
  }, [isDraggingLogo, isDraggingImage, getCanvasCoords]);

  const resetLogoPosition = useCallback(() => {
    setOtvLogoX(CANVAS_SIZE / 2);
    setOtvLogoY(CANVAS_SIZE - 60);
    setOtvLogoSize(OTV_LOGO_DEFAULT_SIZE);
  }, []);

  const resetImagePosition = useCallback(() => {
    setImageOffsetX(0);
    setImageOffsetY(0);
    setImageZoom(1);
  }, []);

  const scrollGallery = useCallback((dir: number) => {
    galleryRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  }, []);

  const sectionTabs = [
    { id: "content" as const, icon: Camera, label: "\u0995\u09A8\u09CD\u099F\u09C7\u09A8\u09CD\u099F" },
    { id: "style" as const, icon: Wand2, label: "\u09B8\u09CD\u099F\u09BE\u0987\u09B2" },
    { id: "settings" as const, icon: Settings2, label: "\u09B8\u09C7\u099F\u09BF\u0982\u09B8" },
  ];

  return (
    <div className="min-h-screen text-white relative" style={{ fontFamily: BN, background: `linear-gradient(165deg, ${G.bg1} 0%, ${G.bg2} 35%, ${G.bg3} 65%, ${G.bg1} 100%)` }} data-testid="home-page">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle, rgba(120,100,255,0.14) 0%, rgba(90,70,210,0.07) 40%, transparent 70%)" }} animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(210,155,255,0.10) 0%, transparent 70%)" }} animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
        <motion.div className="absolute bottom-20 right-1/4 w-[400px] h-[300px]" style={{ background: "radial-gradient(ellipse, rgba(70,145,255,0.09) 0%, transparent 70%)" }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 5 }} />
        <motion.div className="absolute top-2/3 left-1/3 w-[350px] h-[350px] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,190,58,0.08) 0%, transparent 70%)" }} animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 7 }} />
        <motion.div className="absolute top-10 left-1/2 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(0,210,255,0.06) 0%, transparent 70%)" }} animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 9 }} />
        <div className="absolute inset-0" style={{ background: "repeating-conic-gradient(rgba(110,130,220,0.012) 0% 25%, transparent 0% 50%) 0 0 / 80px 80px" }} />
      </div>

      <header className="relative z-50 sticky top-0 glass-header-shimmer" style={{ background: G.headerBg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, borderBottom: `1px solid ${G.panelBorder}`, boxShadow: "0 4px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
        <div className="max-w-[1700px] mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, type: "spring" }}>
            <div className="relative">
              <img src={otvLogoPath} alt="OTV" className="w-12 h-12 rounded-2xl object-contain" style={{ background: "rgba(100,120,220,0.10)", padding: "3px", border: `1px solid ${G.panelBorder}` }} data-testid="img-otv-logo" onError={(e) => { (e.target as HTMLImageElement).src = otvLogoTransparent; }} />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-400 border-2" style={{ borderColor: G.bg1 }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }} data-testid="text-app-title">OTV Card Maker</h1>
              <p className="text-xs font-bold glass-text-shimmer" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.20em", color: G.gold }}>LIQUID GLASS STUDIO</p>
            </div>
          </motion.div>
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: G.panel, border: `1px solid ${G.panelBorder}`, borderRadius: G.r, backdropFilter: G.blurSm }}>
              <span className="text-[12px] text-white/50 font-bold" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em" }}>FREE</span>
              <Switch checked={isPro} onCheckedChange={setIsPro} data-testid="switch-pro-toggle" />
              <Crown className={`w-3.5 h-3.5 transition-colors duration-500 ${isPro ? "text-amber-400" : "text-white/45"}`} />
            </div>
          </motion.div>
        </div>
      </header>

      <div className="relative z-10">
        <div className="max-w-[1700px] mx-auto px-6 pt-6 pb-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: G.gold }} />
                <span className="text-sm font-bold text-white/70 uppercase" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.15em" }}>{templates.length} Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="খুঁজুন..."
                    className="h-9 pl-9 pr-4 text-sm text-white/70 placeholder:text-white/35 border-0 outline-none focus:ring-1"
                    style={{ background: G.panel, border: `1px solid ${G.panelBorder}`, borderRadius: G.rSm, width: "160px", fontFamily: BN, '--tw-ring-color': G.inputFocus } as React.CSSProperties}
                    data-testid="input-template-search"
                  />
                </div>
                <button onClick={() => setShowTemplateGrid(!showTemplateGrid)} className="p-2 transition-all" style={{ background: showTemplateGrid ? G.accent : "transparent", border: `1px solid ${showTemplateGrid ? G.accentBorder : G.panelBorder}`, borderRadius: G.rSm }} data-testid="button-toggle-grid">
                  <Grid3X3 className="w-4 h-4 text-white/65" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {TEMPLATE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setTemplateFilter(cat.id)}
                  className="flex-shrink-0 px-4 py-2 text-sm font-bold transition-all duration-300 whitespace-nowrap"
                  style={{
                    borderRadius: G.rSm,
                    background: templateFilter === cat.id ? G.accent : "transparent",
                    border: `1px solid ${templateFilter === cat.id ? G.accentBorder : G.panelBorder}`,
                    color: templateFilter === cat.id ? "rgba(210,205,255,1)" : "rgba(255,255,255,0.55)",
                    boxShadow: templateFilter === cat.id ? "0 2px 12px rgba(120,110,255,0.15), inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
                  }}
                  data-testid={`button-filter-${cat.id}`}
                >
                  {cat.bn}
                </button>
              ))}
            </div>

            {showTemplateGrid ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[320px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(100,110,200,0.1) transparent" }} data-testid="template-gallery">
                {filteredTemplates.map((t, i) => {
                  const isActive = selectedTemplate.id === t.id;
                  const isSplit = DUAL_TEMPLATES.includes(t.id);
                  return (
                    <motion.button
                      key={t.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.015 * i, duration: 0.3 }}
                      onClick={() => { setSelectedTemplate(t); setCategory(t.defaultCategory); setIsGenerated(false); }}
                      className="group relative"
                      data-testid={`button-template-${t.id}`}
                    >
                      <div className={`overflow-hidden transition-all duration-400 ${isActive ? "scale-[1.04]" : "opacity-50 hover:opacity-80"}`} style={{ borderRadius: G.rSm, border: isActive ? `2px solid rgba(140,130,255,0.6)` : `1px solid ${G.panelBorder}`, boxShadow: isActive ? "0 4px 20px rgba(110,100,255,0.20), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 2px 6px rgba(0,0,0,0.12)" }}>
                        <div className="h-[52px] relative" style={isSplit ? { background: `linear-gradient(90deg, ${t.previewColors[0]} 50%, ${t.previewColors[1]} 50%)` } : { background: `linear-gradient(135deg, ${t.previewColors[0]}, ${t.previewColors[1]})` }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                          <div className="absolute bottom-1 left-1.5 space-y-[1px]">
                            <div className="h-[2px] w-4 rounded-full" style={{ backgroundColor: t.accentColor, boxShadow: `0 0 4px ${t.accentColor}50` }} />
                            <div className="h-[1.5px] w-[50%] bg-white/20 rounded-full" />
                          </div>
                          {isActive && (
                            <motion.div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(120,110,255,0.95)", boxShadow: "0 2px 10px rgba(120,110,255,0.5)" }} layoutId="tmpl-active" transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                              <Check className="w-2.5 h-2.5 text-white" />
                            </motion.div>
                          )}
                        </div>
                        <div className="px-1.5 py-1" style={{ background: G.panel }}>
                          <p className="text-sm font-bold text-white/65 truncate">{t.nameBn}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="relative group/gallery">
                <button onClick={() => scrollGallery(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-all" style={{ background: "rgba(8,10,20,0.8)", backdropFilter: "blur(10px)", border: `1px solid ${G.panelBorder}` }} data-testid="button-scroll-left">
                  <ChevronLeft className="w-4 h-4 text-white/50" />
                </button>
                <button onClick={() => scrollGallery(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-all" style={{ background: "rgba(8,10,20,0.8)", backdropFilter: "blur(10px)", border: `1px solid ${G.panelBorder}` }} data-testid="button-scroll-right">
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </button>

                <div ref={galleryRef} className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties} data-testid="template-gallery">
                  {filteredTemplates.map((t, i) => {
                    const isActive = selectedTemplate.id === t.id;
                    const isSplit = DUAL_TEMPLATES.includes(t.id);
                    return (
                      <motion.button
                        key={t.id}
                        initial={{ opacity: 0, y: 12, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.02 * Math.min(i, 15), duration: 0.35, type: "spring" }}
                        onClick={() => { setSelectedTemplate(t); setCategory(t.defaultCategory); setIsGenerated(false); }}
                        className="flex-shrink-0 snap-center group relative"
                        data-testid={`button-template-${t.id}`}
                      >
                        <div className={`w-[95px] overflow-hidden transition-all duration-400 ${isActive ? "scale-[1.04]" : "opacity-50 hover:opacity-80"}`} style={{ borderRadius: G.rSm, border: isActive ? "2px solid rgba(140,130,255,0.6)" : `1px solid ${G.panelBorder}`, boxShadow: isActive ? "0 6px 24px rgba(110,100,255,0.20), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 2px 8px rgba(0,0,0,0.15)" }}>
                          <div className="h-[62px] relative" style={isSplit ? { background: `linear-gradient(90deg, ${t.previewColors[0]} 50%, ${t.previewColors[1]} 50%)` } : { background: `linear-gradient(135deg, ${t.previewColors[0]}, ${t.previewColors[1]})` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-1.5 left-2 space-y-[2px]">
                              <div className="h-[2.5px] w-5 rounded-full" style={{ backgroundColor: t.accentColor, boxShadow: `0 0 6px ${t.accentColor}60` }} />
                              <div className="h-[1.5px] w-[50%] bg-white/20 rounded-full" />
                            </div>
                            {isActive && (
                              <motion.div layoutId="tmpl-active-h" className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(120,110,255,0.95)", boxShadow: "0 2px 10px rgba(120,110,255,0.5)" }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                                <Check className="w-2.5 h-2.5 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <div className="px-2 py-1.5" style={{ background: G.panel }}>
                            <p className="text-[12px] font-bold text-white/65 truncate leading-tight">{t.nameBn}</p>
                            <p className="text-sm text-white/55 truncate mt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>{t.name}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="max-w-[1700px] mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_540px] xl:grid-cols-[1fr_600px] gap-6 items-start">

            <motion.div className="order-2 lg:order-1 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <div className="flex gap-1 p-1.5" style={{ background: G.panel, border: `1px solid ${G.panelBorder}`, borderRadius: G.r, backdropFilter: G.blurSm, boxShadow: "0 2px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                {sectionTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 text-base font-bold transition-all duration-400 relative ${activeSection === tab.id ? "text-white" : "text-white/55 hover:text-white/75"}`}
                    style={{ borderRadius: G.rSm }}
                    data-testid={`tab-${tab.id}`}
                  >
                    {activeSection === tab.id && (
                      <motion.div layoutId="tab-glass" className="absolute inset-0" style={{ borderRadius: G.rSm, background: "linear-gradient(135deg, rgba(140,130,255,0.25), rgba(110,170,255,0.18))", border: `1px solid rgba(155,145,255,0.40)`, boxShadow: "0 4px 24px rgba(110,100,255,0.18), inset 0 1px 0 rgba(255,255,255,0.10)" }} transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                    )}
                    <span className="relative z-10 flex items-center gap-2.5">
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeSection === "content" && (
                  <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-3">

                    <div className="flex gap-2 mb-1">
                      <button onClick={loadRandomPreset} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all hover:scale-[1.02]" style={{ background: G.accent, border: `1px solid ${G.accentBorder}`, borderRadius: G.rSm, color: "rgba(180,175,255,0.8)" }} data-testid="button-random-demo">
                        <Shuffle className="w-3 h-3" />
                        {"\u09A1\u09C7\u09AE\u09CB \u09AA\u09CD\u09B0\u09BF\u09B8\u09C7\u099F"}
                      </button>
                      <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all hover:scale-[1.02]" style={{ background: "rgba(200,50,50,0.08)", border: "1px solid rgba(200,50,50,0.15)", borderRadius: G.rSm, color: "rgba(255,120,120,0.6)" }} data-testid="button-reset-all">
                        <Trash2 className="w-3 h-3" />
                        {"\u09B0\u09BF\u09B8\u09C7\u099F"}
                      </button>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                      {DEMO_PRESETS.map((p, i) => (
                        <button key={i} onClick={() => loadPreset(p)} className="flex-shrink-0 px-2.5 py-1.5 text-[12px] font-bold transition-all hover:opacity-80 whitespace-nowrap" style={{ background: `${p.accentColor}15`, border: `1px solid ${p.accentColor}30`, borderRadius: G.rSm, color: `${p.accentColor}cc` }} data-testid={`button-preset-${i}`}>
                          {p.bn}
                        </button>
                      ))}
                    </div>

                    <CollapsibleSection title={"\u09AB\u099F\u09CB \u0993 \u09B2\u09CB\u0997\u09CB"} icon={ImageIcon}>
                      <div className="grid gap-3 grid-cols-2">
                        <div>
                          <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09AB\u099F\u09CB \u09E7" : "\u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB"}</p>
                          <input ref={mainPhotoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" data-testid="input-main-photo" />
                          <label htmlFor="photo-upload" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") mainPhotoInputRef.current?.click(); }} className="block cursor-pointer transition-all duration-400 overflow-hidden group" style={{ background: G.panel, border: `1.5px dashed ${G.inputBorder}`, borderRadius: G.rSm, backdropFilter: G.blurSm }} data-testid="dropzone-main-photo">
                            {mainPhotoSrc ? (
                              <div className="relative">
                                <img src={mainPhotoSrc} alt="Uploaded news photo" className="w-full h-28 object-cover" />
                                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${G.bg1}80 0%, transparent 60%)` }} />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (mainPhotoSrc) URL.revokeObjectURL(mainPhotoSrc); setMainPhotoSrc(null); setMainPhotoImg(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }} data-testid="button-remove-photo">
                                  <X className="w-3 h-3 text-white/80" />
                                </button>
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveBg(); }} disabled={isRemovingBg} className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] font-bold transition-all" style={{ background: isRemovingBg ? "rgba(100,90,220,0.3)" : "rgba(100,90,220,0.6)", backdropFilter: "blur(10px)", color: "white", border: `1px solid rgba(130,120,255,0.3)` }} data-testid="button-remove-bg">
                                  {isRemovingBg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eraser className="w-3 h-3" />}
                                  {isRemovingBg ? "Processing..." : "BG Remove"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-7 group-hover:scale-105 transition-transform duration-500">
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2" style={{ background: G.accent, border: `1px solid ${G.accentBorder}` }}>
                                  <Upload className="w-4 h-4 text-indigo-400/40" />
                                </div>
                                <p className="text-sm text-white/35 font-medium">{isDual ? "\u09AC\u09BE\u09AE \u09AB\u099F\u09CB" : "\u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1"}</p>
                              </div>
                            )}
                          </label>
                        </div>

                        <div>
                          <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09AB\u099F\u09CB \u09E8" : "\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB"}</p>
                          {isDual ? (
                            <>
                              <input ref={secondPhotoInputRef} type="file" accept="image/*" onChange={handleSecondPhotoUpload} className="hidden" id="photo2-upload" data-testid="input-second-photo" />
                              <label htmlFor="photo2-upload" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") secondPhotoInputRef.current?.click(); }} className="block cursor-pointer transition-all duration-400 overflow-hidden group" style={{ background: G.panel, border: `1.5px dashed ${G.inputBorder}`, borderRadius: G.rSm }} data-testid="dropzone-second-photo">
                                {secondPhotoSrc ? (
                                  <div className="relative">
                                    <img src={secondPhotoSrc} alt="Second photo" className="w-full h-28 object-cover" />
                                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${G.bg1}80 0%, transparent 60%)` }} />
                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (secondPhotoSrc) URL.revokeObjectURL(secondPhotoSrc); setSecondPhotoSrc(null); setSecondPhotoImg(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }} data-testid="button-remove-second-photo">
                                      <X className="w-3 h-3 text-white/80" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-7 group-hover:scale-105 transition-transform duration-500">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2" style={{ background: G.accent, border: `1px solid ${G.accentBorder}` }}>
                                      <Users className="w-4 h-4 text-indigo-400/40" />
                                    </div>
                                    <p className="text-sm text-white/35 font-medium">{"\u09A1\u09BE\u09A8 \u09AB\u099F\u09CB"}</p>
                                  </div>
                                )}
                              </label>
                            </>
                          ) : (
                            <>
                              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" data-testid="input-logo" />
                              <label htmlFor="logo-upload" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") logoInputRef.current?.click(); }} className="block cursor-pointer transition-all duration-400 overflow-hidden group" style={{ background: G.panel, border: `1.5px dashed ${G.inputBorder}`, borderRadius: G.rSm }} data-testid="dropzone-logo">
                                {logoSrc ? (
                                  <div className="relative flex items-center justify-center py-5">
                                    <img src={logoSrc} alt="Uploaded channel logo" className="h-16 object-contain" />
                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (logoSrc) URL.revokeObjectURL(logoSrc); setLogoSrc(null); setLogoImg(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }} data-testid="button-remove-logo">
                                      <X className="w-3 h-3 text-white/80" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-7 group-hover:scale-105 transition-transform duration-500">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2" style={{ background: G.accent, border: `1px solid ${G.accentBorder}` }}>
                                      <ImageIcon className="w-4 h-4 text-indigo-400/40" />
                                    </div>
                                    <p className="text-sm text-white/35 font-medium">PNG {"\u09B2\u09CB\u0997\u09CB"}</p>
                                  </div>
                                )}
                              </label>
                            </>
                          )}
                        </div>
                      </div>

                      {isDual && (
                        <div className="mt-3">
                          <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB"}</p>
                          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload-dual" data-testid="input-logo-dual" />
                          <label htmlFor="logo-upload-dual" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") logoInputRef.current?.click(); }} className="block cursor-pointer transition-all duration-400 overflow-hidden group" style={{ background: G.panel, border: `1.5px dashed ${G.inputBorder}`, borderRadius: G.rSm }} data-testid="dropzone-logo-dual">
                            {logoSrc ? (
                              <div className="relative flex items-center justify-center py-4">
                                <img src={logoSrc} alt="Logo" className="h-12 object-contain" />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (logoSrc) URL.revokeObjectURL(logoSrc); setLogoSrc(null); setLogoImg(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }} data-testid="button-remove-logo-dual">
                                  <X className="w-3 h-3 text-white/80" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-4 gap-2 group-hover:scale-105 transition-transform duration-500">
                                <ImageIcon className="w-4 h-4 text-indigo-400/20" />
                                <p className="text-sm text-white/45 font-medium">PNG {"\u09B2\u09CB\u0997\u09CB \u0986\u09AA\u09B2\u09CB\u09A1"}</p>
                              </div>
                            )}
                          </label>
                        </div>
                      )}
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u0993 \u099F\u09C7\u0995\u09CD\u09B8\u099F"} icon={Type}>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09E7" : "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE"}</p>
                          <Textarea
                            value={headline}
                            onChange={(e) => { setHeadline(e.target.value); setIsGenerated(false); }}
                            placeholder={"\u09A8\u09BF\u0989\u099C \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09B2\u09BF\u0996\u09C1\u09A8..."}
                            className="border-0 text-white text-sm resize-none min-h-[72px] focus-visible:ring-1"
                            style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}`, '--tw-ring-color': G.inputFocus } as React.CSSProperties}
                            data-testid="textarea-headline"
                          />
                        </div>

                        <div>
                          <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u09B8\u09BE\u09AC-\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE"}</p>
                          <Input
                            value={subheadline}
                            onChange={(e) => { setSubheadline(e.target.value); setIsGenerated(false); }}
                            placeholder={"\u09B8\u09BE\u09AC-\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09B2\u09BF\u0996\u09C1\u09A8..."}
                            className="border-0 text-white text-xs h-10"
                            style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }}
                            data-testid="input-subheadline"
                          />
                        </div>

                        {(isDual || selectedTemplate.id === "news-summary") && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                            <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09E8" : "\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 / \u09AC\u09C1\u09B2\u09C7\u099F"}</p>
                            <Textarea
                              value={headline2}
                              onChange={(e) => { setHeadline2(e.target.value); setIsGenerated(false); }}
                              placeholder={isDual ? "\u09A6\u09CD\u09AC\u09BF\u09A4\u09C0\u09AF\u09BC \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE..." : "\u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09B2\u09BE\u0987\u09A8\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AC\u09C1\u09B2\u09C7\u099F..."}
                              className="border-0 text-white text-sm resize-none min-h-[72px] focus-visible:ring-1"
                              style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }}
                              data-testid="textarea-headline2"
                            />
                          </motion.div>
                        )}

                        <div>
                          <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>
                            <Quote className="w-3 h-3 inline mr-1 opacity-50" />
                            {"\u0989\u09A6\u09CD\u09A7\u09C3\u09A4\u09BF"}
                          </p>
                          <Textarea
                            value={quoteText}
                            onChange={(e) => { setQuoteText(e.target.value); setIsGenerated(false); }}
                            placeholder={"\u0989\u09A6\u09CD\u09A7\u09C3\u09A4\u09BF \u09B2\u09BF\u0996\u09C1\u09A8... (\u0995\u09CB\u099F \u0995\u09BE\u09B0\u09CD\u09A1\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4)"}
                            className="border-0 text-white text-sm resize-none min-h-[60px] focus-visible:ring-1"
                            style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }}
                            data-testid="textarea-quote"
                          />
                        </div>

                        <div>
                          <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>
                            <List className="w-3 h-3 inline mr-1 opacity-50" />
                            {"\u09AC\u09C1\u09B2\u09C7\u099F \u09AA\u09AF\u09BC\u09C7\u09A8\u09CD\u099F"}
                          </p>
                          <Textarea
                            value={bulletText}
                            onChange={(e) => { setBulletText(e.target.value); setIsGenerated(false); }}
                            placeholder={"\u09AA\u09CD\u09B0\u09A4\u09BF \u09B2\u09BE\u0987\u09A8\u09C7 \u098F\u0995\u099F\u09BF \u09AC\u09C1\u09B2\u09C7\u099F \u09AA\u09AF\u09BC\u09C7\u09A8\u09CD\u099F..."}
                            className="border-0 text-white text-sm resize-none min-h-[60px] focus-visible:ring-1"
                            style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }}
                            data-testid="textarea-bullets"
                          />
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u09AE\u09C7\u099F\u09BE \u09A4\u09A5\u09CD\u09AF"} icon={SlidersHorizontal} defaultOpen={false}>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF"}</p>
                            <Select value={category} onValueChange={(v) => { setCategory(v); setIsGenerated(false); }}>
                              <SelectTrigger className="border-0 text-white text-xs h-10" style={{ background: G.input, borderRadius: G.rSm, border: `1px solid ${G.inputBorder}` }} data-testid="select-category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-0" style={{ background: "rgba(8,10,20,0.96)", backdropFilter: G.blur, borderRadius: G.rSm, border: `1px solid ${G.panelBorder}` }}>
                                {CATEGORIES.map((c) => (
                                  <SelectItem key={c.value} value={c.value} className="text-white/75 text-xs focus:bg-indigo-500/8 focus:text-white" style={{ borderRadius: "10px" }}>
                                    {c.bn} &middot; {c.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>Via</p>
                            <Input value={viaText} onChange={(e) => { setViaText(e.target.value); setIsGenerated(false); }} placeholder="Via | OTV" className="border-0 text-white text-xs h-10" style={{ background: G.input, borderRadius: G.rSm, border: `1px solid ${G.inputBorder}` }} data-testid="input-via-text" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>
                              <Calendar className="w-3 h-3 inline mr-1 opacity-50" />
                              {"\u09A4\u09BE\u09B0\u09BF\u0996"}
                            </p>
                            <Input value={dateText} onChange={(e) => { setDateText(e.target.value); setIsGenerated(false); }} placeholder={"\u09E7\u09EB \u09AE\u09BE\u09B0\u09CD\u099A \u09E8\u09E6\u09E8\u09EC"} className="border-0 text-white text-xs h-10" style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }} data-testid="input-date" />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u09B9\u09BE\u0987\u09B2\u09BE\u0987\u099F \u09B6\u09AC\u09CD\u09A6"}</p>
                            <Input value={highlightWords} onChange={(e) => { setHighlightWords(e.target.value); setIsGenerated(false); }} placeholder={"\u09B6\u09AC\u09CD\u09A6\u09E7, \u09B6\u09AC\u09CD\u09A6\u09E8"} className="border-0 text-white text-xs h-10" style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }} data-testid="input-highlight-words" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF \u09E7" : "\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u09B0 \u09A8\u09BE\u09AE"}</p>
                            <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder={"\u09A8\u09BE\u09AE"} className="border-0 text-white text-xs h-10" style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }} data-testid="input-person-name" />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u09AA\u09A6\u09AC\u09C0"}</p>
                            <Input value={personTitle} onChange={(e) => setPersonTitle(e.target.value)} placeholder={"\u09AA\u09A6\u09AC\u09C0"} className="border-0 text-white text-xs h-10" style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }} data-testid="input-person-title" />
                          </div>
                        </div>

                        {isDual && (
                          <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                            <div>
                              <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF \u09E8"}</p>
                              <Input value={personName2} onChange={(e) => setPersonName2(e.target.value)} placeholder={"\u09A8\u09BE\u09AE \u09E8"} className="border-0 text-white text-xs h-10" style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }} data-testid="input-person-name2" />
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u09AA\u09A6\u09AC\u09C0 \u09E8"}</p>
                              <Input value={personTitle2} onChange={(e) => setPersonTitle2(e.target.value)} placeholder={"\u09AA\u09A6\u09AC\u09C0 \u09E8"} className="border-0 text-white text-xs h-10" style={{ background: G.input, borderRadius: G.rSm, fontFamily: BN, border: `1px solid ${G.inputBorder}` }} data-testid="input-person-title2" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </CollapsibleSection>
                  </motion.div>
                )}

                {activeSection === "style" && (
                  <motion.div key="style" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-3">

                    <CollapsibleSection title={"\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u09B8\u09C7\u09A8\u09CD\u099F \u0995\u09BE\u09B2\u09BE\u09B0"} icon={Palette}>
                      <div className="grid grid-cols-5 gap-2">
                        {ACCENT_COLORS.map((c) => {
                          const isAct = highlightColor === c.color;
                          return (
                            <button key={c.color} onClick={() => { setHighlightColor(c.color); setIsGenerated(false); }} className="group" data-testid={`button-color-${c.color.replace("#", "")}`}>
                              <div className={`relative p-3 flex flex-col items-center gap-1.5 transition-all duration-400 ${isAct ? "scale-[1.06]" : "opacity-30 hover:opacity-60"}`} style={{ borderRadius: G.rSm, background: isAct ? `${c.color}08` : G.panel, border: isAct ? `2px solid ${c.color}30` : `1px solid ${G.panelBorder}`, boxShadow: isAct ? `0 4px 20px ${c.color}15, inset 0 1px 0 rgba(255,255,255,0.02)` : "none" }}>
                                <div className={`w-8 h-8 rounded-xl transition-all ${isAct ? "scale-110" : ""}`} style={{ backgroundColor: c.color, boxShadow: isAct ? `0 4px 20px ${c.color}35` : "none" }} />
                                <span className="text-sm font-bold text-white/75">{c.bn}</span>
                                {isAct && (
                                  <motion.div layoutId="color-check" className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: c.color, boxShadow: `0 2px 8px ${c.color}40` }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u099F\u09C7\u0995\u09CD\u09B8\u099F \u0995\u09BE\u09B2\u09BE\u09B0"} icon={Palette} defaultOpen={false}>
                      <div className="space-y-3">
                        {([
                          { label: "\u09B9\u09C7\u09A1\u09B2\u09BE\u0987\u09A8 \u0995\u09BE\u09B2\u09BE\u09B0", value: headlineColor, setter: setHeadlineColor, defaultVal: "#ffffff", testId: "headline-color" },
                          { label: "\u09B8\u09BE\u09AC-\u09B9\u09C7\u09A1\u09B2\u09BE\u0987\u09A8 \u0995\u09BE\u09B2\u09BE\u09B0", value: subheadlineColor, setter: setSubheadlineColor, defaultVal: "#cccccc", testId: "subheadline-color" },
                          { label: "\u09B2\u09C7\u09AC\u09C7\u09B2 \u0995\u09BE\u09B2\u09BE\u09B0", value: labelColor, setter: setLabelColor, defaultVal: "#ffffff", testId: "label-color" },
                          { label: "\u09B8\u09CB\u09B0\u09CD\u09B8 \u099F\u09C7\u0995\u09CD\u09B8\u099F \u0995\u09BE\u09B2\u09BE\u09B0", value: sourceTextColor, setter: setSourceTextColor, defaultVal: "#aaaaaa", testId: "source-text-color" },
                          { label: "\u09AC\u09CD\u09AF\u09BE\u099C \u0995\u09BE\u09B2\u09BE\u09B0", value: badgeColor, setter: setBadgeColor, defaultVal: "#ffffff", testId: "badge-color" },
                        ]).map((item) => (
                          <div key={item.testId} className="flex items-center justify-between gap-3">
                            <span className="text-[13px] text-white/35 font-medium flex-1">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={item.value}
                                onChange={(e) => { item.setter(e.target.value); setIsGenerated(false); }}
                                className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                                style={{ background: G.panel, padding: "2px" }}
                                data-testid={`input-${item.testId}`}
                              />
                              <span className="text-sm text-white/45 font-mono w-14 text-right">{item.value}</span>
                              {item.value !== item.defaultVal && (
                                <button
                                  onClick={() => { item.setter(item.defaultVal); setIsGenerated(false); }}
                                  className="p-1 rounded-md"
                                  style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }}
                                  data-testid={`button-reset-${item.testId}`}
                                >
                                  <RotateCcw className="w-2.5 h-2.5 text-white/55" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[13px] text-white/35 font-medium flex-1">{"\u0997\u09CD\u09B2\u09BE\u09B8 \u09AA\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u099F\u09BF\u09A8\u09CD\u099F"}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={glassTintColor.startsWith("rgba") ? "#ffffff" : glassTintColor}
                              onChange={(e) => { setGlassTintColor(e.target.value + "14"); setIsGenerated(false); }}
                              className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                              style={{ background: G.panel, padding: "2px" }}
                              data-testid="input-glass-tint-color"
                            />
                            <span className="text-sm text-white/45 font-mono w-14 text-right truncate">{glassTintColor.substring(0, 12)}</span>
                            {glassTintColor !== "rgba(255,255,255,0.08)" && (
                              <button
                                onClick={() => { setGlassTintColor("rgba(255,255,255,0.08)"); setIsGenerated(false); }}
                                className="p-1 rounded-md"
                                style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }}
                                data-testid="button-reset-glass-tint-color"
                              >
                                <RotateCcw className="w-2.5 h-2.5 text-white/55" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u0995\u09BE\u09B2\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BF\u09B8\u09C7\u099F"} icon={Sparkles} defaultOpen={false}>
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_PRESETS.map((p) => {
                          const isAct = selectedColorPreset?.id === p.id;
                          return (
                            <button key={p.id} onClick={() => { setSelectedColorPreset(isAct ? null : p); setIsGenerated(false); }} className="group" data-testid={`button-color-preset-${p.id}`}>
                              <div className={`relative p-2.5 flex flex-col items-center gap-1.5 transition-all duration-400 ${isAct ? "scale-[1.06]" : "opacity-30 hover:opacity-60"}`} style={{ borderRadius: G.rSm, background: isAct ? `${p.accent}10` : G.panel, border: isAct ? `2px solid ${p.accent}40` : `1px solid ${G.panelBorder}`, boxShadow: isAct ? `0 4px 16px ${p.accent}20` : "none" }}>
                                <div className="w-8 h-8 rounded-xl overflow-hidden flex" style={{ boxShadow: isAct ? `0 2px 12px ${p.accent}30` : "none" }}>
                                  {p.colors.slice(0, 3).map((c, ci) => (
                                    <div key={ci} className="flex-1 h-full" style={{ backgroundColor: c }} />
                                  ))}
                                </div>
                                <span className="text-sm font-bold text-white/75 text-center leading-tight">{p.nameBn}</span>
                                {isAct && (
                                  <motion.div layoutId="color-preset-check" className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: p.accent, boxShadow: `0 2px 8px ${p.accent}40` }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u09AC\u09CD\u09AF\u09BE\u0995\u0997\u09CD\u09B0\u09BE\u0989\u09A8\u09CD\u09A1 \u09AA\u09CD\u09B0\u09BF\u09B8\u09C7\u099F"} icon={Layers} defaultOpen={false}>
                      <div className="grid grid-cols-5 gap-2">
                        {BG_PRESETS.map((p) => {
                          const isAct = selectedBgPreset?.id === p.id;
                          const bgGrad = `linear-gradient(135deg, ${p.gradientStops.join(", ")})`;
                          return (
                            <button key={p.id} onClick={() => { setSelectedBgPreset(isAct ? null : p); setIsGenerated(false); }} className="group" data-testid={`button-bg-preset-${p.id}`}>
                              <div className={`relative p-2.5 flex flex-col items-center gap-1.5 transition-all duration-400 ${isAct ? "scale-[1.06]" : "opacity-30 hover:opacity-60"}`} style={{ borderRadius: G.rSm, background: isAct ? "rgba(100,100,220,0.08)" : G.panel, border: isAct ? "2px solid rgba(130,120,255,0.3)" : `1px solid ${G.panelBorder}`, boxShadow: isAct ? "0 4px 16px rgba(110,100,255,0.12)" : "none" }}>
                                <div className="w-8 h-8 rounded-xl" style={{ background: bgGrad, boxShadow: isAct ? "0 2px 12px rgba(0,0,0,0.3)" : "none" }} />
                                <span className="text-sm font-bold text-white/75 text-center leading-tight">{p.nameBn}</span>
                                {isAct && (
                                  <motion.div layoutId="bg-preset-check" className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(110,100,255,0.9)", boxShadow: "0 2px 8px rgba(110,100,255,0.4)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u0997\u09CD\u09B2\u09BE\u09B8 \u09B8\u09CD\u099F\u09BE\u0987\u09B2"} icon={Palette} defaultOpen={false}>
                      <div className="grid grid-cols-4 gap-2">
                        {GLASS_STYLES.map((s) => {
                          const isAct = selectedGlassStyle?.id === s.id;
                          return (
                            <button key={s.id} onClick={() => { setSelectedGlassStyle(isAct ? null : s); setIsGenerated(false); }} className="group" data-testid={`button-glass-style-${s.id}`}>
                              <div className={`relative p-3 flex flex-col items-center gap-1.5 transition-all duration-400 ${isAct ? "scale-[1.04]" : "opacity-30 hover:opacity-60"}`} style={{ borderRadius: G.rSm, background: isAct ? "rgba(100,100,220,0.1)" : G.panel, border: isAct ? "2px solid rgba(130,120,255,0.3)" : `1px solid ${G.panelBorder}`, boxShadow: isAct ? "0 4px 16px rgba(110,100,255,0.1)" : "none" }}>
                                <div className="w-10 h-6 rounded-lg" style={{ background: `rgba(255,255,255,${s.bgOpacity})`, border: `1px solid ${s.edgeColor}`, backdropFilter: `blur(${s.blurLevel}px)`, boxShadow: isAct ? `0 0 8px ${s.edgeColor}` : "none" }} />
                                <span className="text-sm font-bold text-white/75 text-center leading-tight">{s.nameBn}</span>
                                {isAct && (
                                  <motion.div layoutId="glass-style-check" className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(110,100,255,0.9)", boxShadow: "0 2px 8px rgba(110,100,255,0.4)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u0985\u099F\u09CB \u09A1\u09C7\u0995\u09CB\u09B0\u09C7\u099F"} icon={Wand2} defaultOpen={false}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-white/35 font-medium">{"\u0985\u099F\u09CB \u09A1\u09C7\u0995\u09CB\u09B0\u09C7\u099F"}</span>
                          <Switch checked={autoDecorate} onCheckedChange={(v) => { setAutoDecorate(v); setIsGenerated(false); }} data-testid="switch-auto-decorate" />
                        </div>
                        {autoDecorate && (
                          <>
                            <div>
                              <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u09AA\u09CD\u09B0\u09BF\u09B8\u09C7\u099F"}</p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {DECOR_PRESET_OPTIONS.map((p) => {
                                  const isAct = decorPreset === p.id;
                                  return (
                                    <button key={p.id} onClick={() => { setDecorPreset(p.id); setIsGenerated(false); }} data-testid={`button-decor-preset-${p.id}`}>
                                      <div className={`p-2 text-center transition-all duration-300 ${isAct ? "scale-[1.04]" : "opacity-30 hover:opacity-60"}`} style={{ borderRadius: G.rSm, background: isAct ? G.accent : G.panel, border: `1px solid ${isAct ? G.accentBorder : G.panelBorder}` }}>
                                        <span className={`text-sm font-bold ${isAct ? "text-indigo-300/80" : "text-white/75"}`}>{p.nameBn}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[12px] text-white/35 w-16">{"\u0987\u09AE\u09CB\u099C\u09BF \u0998\u09A8\u09A4\u09CD\u09AC"}</span>
                              <input type="range" min="0" max="1" step="0.05" value={emojiDensity} onChange={(e) => { setEmojiDensity(parseFloat(e.target.value)); setIsGenerated(false); }} className="flex-1 h-1 accent-indigo-500 rounded-full" data-testid="slider-emoji-density" />
                              <span className="text-[12px] text-white/55 font-mono w-6 text-right">{Math.round(emojiDensity * 100)}%</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u0997\u09CD\u09B2\u09BE\u09B8 \u0987\u09AB\u09C7\u0995\u09CD\u099F"} icon={Sparkles} defaultOpen={false}>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-white/35 w-16">{"\u0997\u09CD\u09B2\u09CB \u09A4\u09C0\u09AC\u09CD\u09B0\u09A4\u09BE"}</span>
                          <input type="range" min="0" max="1" step="0.05" value={glowIntensity} onChange={(e) => { setGlowIntensity(parseFloat(e.target.value)); setIsGenerated(false); }} className="flex-1 h-1 accent-indigo-500 rounded-full" data-testid="slider-glow-intensity" />
                          <span className="text-[12px] text-white/55 font-mono w-6 text-right">{Math.round(glowIntensity * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-white/35 w-16">{"\u09AC\u09CD\u09B2\u09BE\u09B0 \u09A4\u09C0\u09AC\u09CD\u09B0\u09A4\u09BE"}</span>
                          <input type="range" min="0" max="1" step="0.05" value={blurIntensity} onChange={(e) => { setBlurIntensity(parseFloat(e.target.value)); setIsGenerated(false); }} className="flex-1 h-1 accent-indigo-500 rounded-full" data-testid="slider-blur-intensity" />
                          <span className="text-[12px] text-white/55 font-mono w-6 text-right">{Math.round(blurIntensity * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-white/35 w-16">{"\u09B8\u09CD\u09AC\u099A\u09CD\u099B\u09A4\u09BE"}</span>
                          <input type="range" min="0" max="1" step="0.05" value={transparencyLevel} onChange={(e) => { setTransparencyLevel(parseFloat(e.target.value)); setIsGenerated(false); }} className="flex-1 h-1 accent-indigo-500 rounded-full" data-testid="slider-transparency" />
                          <span className="text-[12px] text-white/55 font-mono w-6 text-right">{Math.round(transparencyLevel * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-white/35 w-16">{"\u0995\u09B0\u09CD\u09A8\u09BE\u09B0 \u09B0\u09C7\u09A1\u09BF\u09AF\u09BC\u09BE\u09B8"}</span>
                          <input type="range" min="0" max="60" step="2" value={cornerRadius} onChange={(e) => { setCornerRadius(parseInt(e.target.value)); setIsGenerated(false); }} className="flex-1 h-1 accent-indigo-500 rounded-full" data-testid="slider-corner-radius" />
                          <span className="text-[12px] text-white/55 font-mono w-6 text-right">{cornerRadius}px</span>
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u099F\u09C7\u0995\u09CD\u09B8\u099F \u0985\u09CD\u09AF\u09BE\u09B2\u09BE\u0987\u09A8\u09AE\u09C7\u09A8\u09CD\u099F"} icon={AlignLeft} defaultOpen={false}>
                      <div className="flex gap-2">
                        {([
                          { value: "left" as const, icon: AlignLeft, bn: "\u09AC\u09BE\u09AE\u09C7" },
                          { value: "center" as const, icon: AlignCenter, bn: "\u09AE\u09BE\u099D\u09C7" },
                          { value: "right" as const, icon: AlignRight, bn: "\u09A1\u09BE\u09A8\u09C7" },
                        ]).map((a) => {
                          const isAct = textAlign === a.value;
                          return (
                            <button key={a.value} onClick={() => { setTextAlign(a.value); setIsGenerated(false); }} className="flex-1 flex items-center justify-center gap-2 py-3 transition-all" style={{ background: isAct ? G.accent : G.panel, border: `1px solid ${isAct ? G.accentBorder : G.panelBorder}`, borderRadius: G.rSm }} data-testid={`button-align-${a.value}`}>
                              <a.icon className={`w-4 h-4 ${isAct ? "text-indigo-400/70" : "text-white/50"}`} />
                              <span className={`text-[13px] font-bold ${isAct ? "text-indigo-300/80" : "text-white/50"}`}>{a.bn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u09AC\u09BE\u0982\u09B2\u09BE \u09AB\u09A8\u09CD\u099F"} icon={Type} defaultOpen={false}>
                      <div className="grid grid-cols-2 gap-2">
                        {BANGLA_FONT_OPTIONS.map((f) => {
                          const isAct = selectedBanglaFont.id === f.id;
                          return (
                            <button key={f.id} onClick={() => { setSelectedBanglaFont(f); setIsGenerated(false); }} className="group text-left" data-testid={`button-font-${f.id}`}>
                              <div className={`relative p-3 transition-all duration-300 ${isAct ? "scale-[1.02]" : "opacity-40 hover:opacity-70"}`} style={{ borderRadius: G.rSm, background: isAct ? "rgba(100,100,220,0.08)" : G.panel, border: isAct ? "2px solid rgba(130,120,255,0.2)" : `1px solid ${G.panelBorder}` }}>
                                <span className="block text-xl text-white/80 leading-tight mb-1" style={{ fontFamily: f.family }}>{f.bn}</span>
                                <span className="text-[12px] font-bold text-white/55">{f.name}</span>
                                {isAct && (
                                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "rgba(110,100,255,0.3)" }}>
                                    <Check className="w-2 h-2 text-indigo-400" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u09AC\u09CD\u09AF\u09BE\u0995\u0997\u09CD\u09B0\u09BE\u0989\u09A8\u09CD\u09A1 \u0987\u09AB\u09C7\u0995\u09CD\u099F"} icon={Grid2X2} defaultOpen={false}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-white/35 font-medium">{"\u0997\u09CD\u09B0\u09BF\u09A1 \u09B2\u09BE\u0987\u09A8"}</span>
                          <Switch checked={gridEnabled} onCheckedChange={(v) => { setGridEnabled(v); setIsGenerated(false); }} data-testid="switch-grid" />
                        </div>
                        {gridEnabled && (
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] text-white/35 w-12">{"\u09A4\u09C0\u09AC\u09CD\u09B0\u09A4\u09BE"}</span>
                            <input type="range" min="0.1" max="1" step="0.1" value={gridIntensity} onChange={(e) => { setGridIntensity(parseFloat(e.target.value)); setIsGenerated(false); }} className="flex-1 h-1 accent-indigo-500 rounded-full" data-testid="slider-grid-intensity" />
                            <span className="text-[12px] text-white/55 font-mono w-6 text-right">{Math.round(gridIntensity * 100)}%</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-white/35 font-medium">{"\u09B8\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09BF \u0997\u09CD\u09B0\u09C7\u0987\u09A8"}</span>
                          <Switch checked={grainEnabled} onCheckedChange={(v) => { setGrainEnabled(v); setIsGenerated(false); }} data-testid="switch-grain" />
                        </div>
                        {grainEnabled && (
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] text-white/35 w-12">{"\u09A4\u09C0\u09AC\u09CD\u09B0\u09A4\u09BE"}</span>
                            <input type="range" min="0.1" max="1" step="0.1" value={grainIntensity} onChange={(e) => { setGrainIntensity(parseFloat(e.target.value)); setIsGenerated(false); }} className="flex-1 h-1 accent-indigo-500 rounded-full" data-testid="slider-grain-intensity" />
                            <span className="text-[12px] text-white/55 font-mono w-6 text-right">{Math.round(grainIntensity * 100)}%</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-white/35 font-medium">{"\u09A8\u09AF\u09BC\u09C7\u099C \u099F\u09C7\u0995\u09CD\u09B8\u099A\u09BE\u09B0"}</span>
                          <Switch checked={textureEnabled} onCheckedChange={(v) => { setTextureEnabled(v); setIsGenerated(false); }} data-testid="switch-texture" />
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={"\u09AA\u09CB\u099C\u09BF\u09B6\u09A8\u09BF\u0982"} icon={Move}>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[13px] font-bold text-white/35">OTV {"\u09B2\u09CB\u0997\u09CB"}</span>
                            <button onClick={resetLogoPosition} className="p-1.5 rounded-lg transition-all hover:scale-105" style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }} data-testid="button-reset-logo-pos">
                              <RotateCcw className="w-3 h-3 text-white/55" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setOtvLogoSize(Math.max(40, otvLogoSize - 15))} className="p-1.5 rounded-lg" style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }} data-testid="button-logo-smaller">
                              <ZoomOut className="w-3 h-3 text-white/55" />
                            </button>
                            <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(100,100,220,0.06)" }}>
                              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((otvLogoSize - 40) / 180) * 100}%`, background: "linear-gradient(90deg, rgba(100,90,220,0.25), rgba(130,120,255,0.4))" }} />
                            </div>
                            <button onClick={() => setOtvLogoSize(Math.min(220, otvLogoSize + 15))} className="p-1.5 rounded-lg" style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }} data-testid="button-logo-bigger">
                              <ZoomIn className="w-3 h-3 text-white/55" />
                            </button>
                            <span className="text-[12px] text-white/45 font-mono w-7 text-right">{otvLogoSize}</span>
                          </div>
                        </div>

                        {mainPhotoImg && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[13px] font-bold text-white/35">{"\u099B\u09AC\u09BF \u09AA\u09CB\u099C\u09BF\u09B6\u09A8"}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setDragMode(dragMode === "image" ? "logo" : "image")}
                                  className="px-2 py-1 rounded-lg text-[12px] font-bold transition-all"
                                  style={{
                                    background: dragMode === "image" ? "rgba(100,90,220,0.2)" : G.panel,
                                    border: `1px solid ${dragMode === "image" ? "rgba(100,90,220,0.4)" : G.panelBorder}`,
                                    color: dragMode === "image" ? "rgba(130,120,255,0.8)" : "rgba(255,255,255,0.25)",
                                  }}
                                  data-testid="button-toggle-drag-mode"
                                >
                                  {dragMode === "image" ? "\u099B\u09AC\u09BF \u09AE\u09CB\u09A1" : "\u09B2\u09CB\u0997\u09CB \u09AE\u09CB\u09A1"}
                                </button>
                                <button onClick={resetImagePosition} className="p-1.5 rounded-lg transition-all hover:scale-105" style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }} data-testid="button-reset-image-pos">
                                  <RotateCcw className="w-3 h-3 text-white/55" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.1))} className="p-1.5 rounded-lg" style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }} data-testid="button-image-zoom-out">
                                <ZoomOut className="w-3 h-3 text-white/55" />
                              </button>
                              <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(100,100,220,0.06)" }}>
                                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((imageZoom - 0.5) / 1.5) * 100}%`, background: "linear-gradient(90deg, rgba(100,90,220,0.25), rgba(130,120,255,0.4))" }} />
                              </div>
                              <button onClick={() => setImageZoom(Math.min(2, imageZoom + 0.1))} className="p-1.5 rounded-lg" style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }} data-testid="button-image-zoom-in">
                                <ZoomIn className="w-3 h-3 text-white/55" />
                              </button>
                              <span className="text-[12px] text-white/45 font-mono w-8 text-right">{Math.round(imageZoom * 100)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleSection>

                    <div className="p-4" style={{ background: G.panel, border: `1px solid ${G.panelBorder}`, borderRadius: G.r }}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <img src={otvLogoPath} alt="OTV" className="w-7 h-7 rounded-xl object-contain" style={{ background: "rgba(100,110,200,0.08)", padding: "2px" }} onError={(e) => { (e.target as HTMLImageElement).src = otvLogoTransparent; }} />
                        <span className="text-sm font-bold text-white/35">OTV {"\u09B2\u09CB\u0997\u09CB \u09B8\u09AC \u0995\u09BE\u09B0\u09CD\u09A1\u09C7 \u09B8\u09CD\u09AC\u09AF\u09BC\u0982\u0995\u09CD\u09B0\u09BF\u09AF\u09BC"}</span>
                      </div>
                      <p className="text-[12px] text-white/45 leading-relaxed">{"\u0993\u099F\u09BF\u09AD\u09BF \u09B2\u09CB\u0997\u09CB \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u0995\u09BE\u09B0\u09CD\u09A1\u09C7 \u0985\u099F\u09CB\u09AE\u09CD\u09AF\u09BE\u099F\u09BF\u0995 \u09AF\u09CB\u0997 \u09B9\u09AF\u09BC \u2022 \u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AA\u09CD\u09AF\u09BE\u09B0\u09C7\u09A8\u09CD\u099F \u09AC\u09CD\u09AF\u09BE\u0995\u0997\u09CD\u09B0\u09BE\u0989\u09A8\u09CD\u09A1"}</p>
                    </div>

                    {!isPro && (
                      <div className="p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${G.goldDim}, rgba(200,168,50,0.06))`, border: `1px solid rgba(200,168,50,0.12)`, borderRadius: G.r }}>
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(200,168,50,0.06), transparent 70%)" }} />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2.5">
                            <Crown className="w-5 h-5 text-amber-400" />
                            <span className="text-[13px] font-bold text-amber-300">{"\u09AA\u09CD\u09B0\u09CB \u0986\u09AA\u0997\u09CD\u09B0\u09C7\u09A1"}</span>
                          </div>
                          <p className="text-sm text-white/50 mb-3 leading-relaxed">{"\u0993\u09AF\u09BC\u09BE\u099F\u09BE\u09B0\u09AE\u09BE\u09B0\u09CD\u0995 \u099B\u09BE\u09DC\u09BE \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8"}</p>
                          <Button onClick={() => setIsPro(true)} size="sm" className="no-default-hover-elevate no-default-active-elevate text-sm font-bold" style={{ background: `linear-gradient(135deg, ${G.gold}, #b8922a)`, color: "#000", borderRadius: G.rSm }} data-testid="button-upgrade-pro">
                            <Crown className="w-3.5 h-3.5 mr-1.5" /> {"\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD\u09C7\u099F"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === "settings" && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-3">

                    <CollapsibleSection title={"\u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u09B8\u09C7\u099F\u09BF\u0982\u09B8"} icon={Download}>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u0995\u09BE\u09B0\u09CD\u09A1 \u09B8\u09BE\u0987\u099C"}</p>
                          <div className="flex gap-2">
                            {[1080, 1200, 2048].map(s => (
                              <button key={s} onClick={() => { setExportSize(s); setIsGenerated(false); }} className="flex-1 py-2 text-[13px] font-bold transition-all" style={{ background: exportSize === s ? G.accent : G.panel, border: `1px solid ${exportSize === s ? G.accentBorder : G.panelBorder}`, borderRadius: G.rSm, color: exportSize === s ? "rgba(180,175,255,0.9)" : "rgba(255,255,255,0.2)" }} data-testid={`button-size-${s}`}>
                                {s}x{s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>

                    <div className="p-5" style={{ background: G.panel, border: `1px solid ${G.panelBorder}`, borderRadius: G.r, backdropFilter: G.blurSm }}>
                      <p className="text-[12px] font-bold text-white/45 uppercase mb-3" style={{ letterSpacing: "0.18em" }}>{"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u09AC\u09BF\u09A7\u09BF"}</p>
                      <div className="space-y-2.5">
                        {[
                          "\u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8 (67+ \u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F)",
                          "\u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8",
                          "\u09A1\u09C1\u09AF\u09BC\u09BE\u09B2 \u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F\u09C7 \u09E8\u099F\u09BF \u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1",
                          "OTV \u09B2\u09CB\u0997\u09CB \u09A1\u09CD\u09B0\u09CD\u09AF\u09BE\u0997 \u0995\u09B0\u09C7 \u09B8\u09B0\u09BE\u09A8",
                          "\u09AC\u09CD\u09AF\u09BE\u0995\u0997\u09CD\u09B0\u09BE\u0989\u09A8\u09CD\u09A1 \u0987\u09AB\u09C7\u0995\u09CD\u099F: \u0997\u09CD\u09B0\u09BF\u09A1, \u0997\u09CD\u09B0\u09C7\u0987\u09A8, \u099F\u09C7\u0995\u09CD\u09B8\u099A\u09BE\u09B0",
                          "\u09B9\u09BE\u0987\u09B2\u09BE\u0987\u099F \u09B6\u09AC\u09CD\u09A6 \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8",
                          "\u09A1\u09C7\u09AE\u09CB \u09AA\u09CD\u09B0\u09BF\u09B8\u09C7\u099F \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B6\u09C1\u09B0\u09C1",
                          "PNG / JPG / PDF \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1",
                          "\u0995\u09CD\u09B2\u09BF\u09AA\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7 \u0995\u09AA\u09BF",
                          "\u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u09B0\u09C7\u099C\u09B2\u09CD\u09AF\u09C1\u09B6\u09A8: 1080/1200/2048",
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: G.accent, border: `1px solid ${G.accentBorder}` }}>
                              <span className="text-sm text-indigo-400 font-bold">{i + 1}</span>
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4" style={{ background: G.panel, border: `1px solid ${G.panelBorder}`, borderRadius: G.r }}>
                      <p className="text-[12px] font-bold text-white/75 uppercase mb-2" style={{ letterSpacing: "0.18em" }}>{"\u09AD\u09BE\u09B0\u09CD\u09B6\u09A8"}</p>
                      <p className="text-sm text-white/50">OTV Card Maker v4.0 &middot; {templates.length} Templates</p>
                      <p className="text-[12px] text-white/10 mt-1">Liquid Glass Studio &middot; otv.online</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <button
                  onClick={generatePremiumCard}
                  disabled={isGenerating}
                  className="w-full relative overflow-hidden group disabled:opacity-50 transition-all duration-500"
                  style={{ height: 58, borderRadius: G.r }}
                  data-testid="button-generate-card"
                >
                  <div className="absolute inset-0 transition-all duration-500" style={{ background: G.iridescent }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: G.iridescentHover }} />
                  <div className="absolute inset-[1px] opacity-25" style={{ borderRadius: "20px", background: "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, transparent 50%)" }} />
                  <div className="absolute -inset-3 rounded-3xl opacity-35 group-hover:opacity-55 blur-2xl transition-all" style={{ background: "linear-gradient(135deg, rgba(232,190,58,0.45), rgba(212,156,255,0.35), rgba(112,184,255,0.35))" }} />
                  <span className="relative z-10 flex items-center justify-center gap-2.5 text-black font-bold text-[14px]" style={{ textShadow: "0 1px 0 rgba(255,255,255,0.15)" }}>
                    {isGenerating ? (
                      <>
                        <motion.span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                        {"\u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4.5 h-4.5" />
                        {"\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8"}
                      </>
                    )}
                  </span>
                </button>
              </motion.div>

              <AnimatePresence>
                {isGenerated && (
                  <motion.div initial={{ opacity: 0, y: 15, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="p-5" style={{ background: "rgba(100,90,255,0.04)", border: "1px solid rgba(110,100,255,0.14)", borderRadius: G.r, backdropFilter: G.blurSm }}>
                    <div className="flex items-center gap-2.5 mb-4">
                      <motion.div className="w-6 h-6 rounded-xl bg-indigo-500/15 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Check className="w-3.5 h-3.5 text-indigo-400" />
                      </motion.div>
                      <span className="text-xs font-bold text-indigo-300">{"\u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF! \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8:"}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { fn: downloadPNG, icon: FileImage, label: "PNG", color: "from-emerald-600 to-green-700", tid: "button-download-png" },
                        { fn: downloadJPG, icon: Download, label: "JPG", color: "from-blue-600 to-indigo-700", tid: "button-download-jpg" },
                        { fn: downloadPDF, icon: FileText, label: "PDF", color: "from-rose-600 to-red-700", tid: "button-download-pdf" },
                        { fn: copyToClipboard, icon: Copy, label: "\u0995\u09AA\u09BF", color: "from-violet-600 to-purple-700", tid: "button-copy-clipboard" },
                      ].map((dl, i) => (
                        <motion.div key={dl.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
                          <button onClick={dl.fn} className={`w-full py-3 text-white font-bold text-sm flex items-center justify-center gap-1.5 bg-gradient-to-br ${dl.color} transition-all hover:scale-[1.03] active:scale-[0.97]`} style={{ borderRadius: G.rSm }} data-testid={dl.tid}>
                            <dl.icon className="w-3.5 h-3.5" />
                            {dl.label}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="order-1 lg:order-2 lg:sticky lg:top-[64px] lg:self-start" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.08, type: "spring" }}>
              <div className="p-3 relative" style={{ background: G.panel, border: `1px solid ${G.panelBorder}`, borderRadius: G.rXl, backdropFilter: G.blurSm, boxShadow: "0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(130,140,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between px-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <motion.div className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-sm font-bold text-white/50 uppercase" style={{ letterSpacing: "0.2em" }}>{"\u09B2\u09BE\u0987\u09AD \u09AA\u09CD\u09B0\u09BF\u09AD\u09BF\u0989"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white/45 px-2 py-1 rounded-xl" style={{ background: G.panel, border: `1px solid ${G.panelBorder}` }}>{selectedTemplate.nameBn}</span>
                    {(isDraggingLogo || isDraggingImage) && (
                      <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-sm text-indigo-400/50 px-2 py-1 rounded-xl" style={{ background: G.accent }}>
                        <Move className="w-3 h-3 inline mr-0.5" />{isDraggingImage ? "\u099B\u09AC\u09BF \u09B8\u09B0\u09BE\u09A8\u09CB..." : "\u09B8\u09B0\u09BE\u09A8\u09CB..."}
                      </motion.span>
                    )}
                    {dragMode === "image" && mainPhotoImg && !isDraggingImage && (
                      <span className="text-sm text-amber-400/50 px-2 py-1 rounded-xl" style={{ background: "rgba(200,168,50,0.08)" }}>
                        <ImageIcon className="w-3 h-3 inline mr-0.5" />{"\u099B\u09AC\u09BF \u09A1\u09CD\u09B0\u09CD\u09AF\u09BE\u0997 \u09AE\u09CB\u09A1"}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  ref={previewRef}
                  className="overflow-hidden relative"
                  style={{ background: "#000", borderRadius: G.r, cursor: (isDraggingLogo || isDraggingImage) ? "grabbing" : (dragMode === "image" && mainPhotoImg ? "grab" : "default") }}
                  data-testid="preview-container"
                  onMouseDown={handlePreviewMouseDown}
                  onMouseMove={handlePreviewMouseMove}
                  onMouseUp={handlePreviewMouseUp}
                  onMouseLeave={handlePreviewMouseUp}
                  onTouchStart={handlePreviewTouchStart}
                  onTouchMove={handlePreviewTouchMove}
                  onTouchEnd={handlePreviewMouseUp}
                >
                  <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full block" data-testid="canvas-preview" />
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(8,10,20,0.6)", backdropFilter: "blur(12px)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex flex-col items-center gap-4">
                          <motion.div className="w-10 h-10 rounded-full" style={{ border: "3px solid rgba(110,100,255,0.15)", borderTopColor: "#818cf8" }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                          <span className="text-sm text-indigo-300 font-semibold">{"\u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7..."}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl pointer-events-auto" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)", border: `1px solid ${G.panelBorder}` }}>
                      <GripVertical className="w-3 h-3 text-white/50" />
                      <span className="text-sm text-white/55 font-medium">{"\u09B2\u09CB\u0997\u09CB \u09A1\u09CD\u09B0\u09CD\u09AF\u09BE\u0997"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2.5 mt-2.5">
                  <span className="text-sm text-white/45 font-mono">{exportSize} &times; {exportSize}</span>
                  <div className="flex items-center gap-1.5">
                    <img src={otvLogoPath} alt="" className="w-3.5 h-3.5 rounded-md object-contain" style={{ background: "rgba(100,100,220,0.06)", padding: "1px" }} onError={(e) => { (e.target as HTMLImageElement).src = otvLogoTransparent; }} />
                    <span className="text-sm text-white/45" style={{ fontFamily: "'Montserrat', sans-serif" }}>otv.online</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <footer className="relative z-10 py-6 mt-8" style={{ borderTop: `1px solid ${G.panelBorder}`, background: "rgba(8,10,20,0.5)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-[1700px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={otvLogoPath} alt="OTV" className="w-8 h-8 rounded-xl object-contain opacity-60" style={{ background: "rgba(100,110,200,0.08)", padding: "2px" }} onError={(e) => { (e.target as HTMLImageElement).src = otvLogoTransparent; }} />
            <span className="text-sm text-white/60 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>OTV Card Maker v4.0 &middot; {templates.length} Templates &middot; otv.online</span>
          </div>
          <p className="text-sm text-white/50">{"\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0995\u09BE\u09B0\u09CD\u09A1 \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F\u09B0"}</p>
        </div>
      </footer>
    </div>
  );
}
