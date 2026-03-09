import {
  wrapText,
  wrapTextLines,
  roundedRect,
  drawImageCover,
  drawImageCoverPositioned,
  createGradient,
  drawBadge,
  drawLogo,
  drawViaText,
  drawPhotoCredit,
  drawBottomTicker,
  drawGridLines,
  drawHighlightedText,
  drawCircularImage,
  drawPaperTexture,
  drawSandyGrain,
  drawEditorialGrid,
  drawNoiseOverlay,
  drawAccentBar,
  drawGlassPanel,
  drawGlowBlobs,
  drawGlassReflection,
  drawGradientMesh,
  drawGlassEdge,
  drawGlassBadge,
  drawDecorativeEmoji,
  drawSparkles,
  drawGlowRing,
  drawFloatingOrbs,
  HEADLINE_FONT,
  SANS_FONT,
  BENGALI_FONT,
} from "./canvas-utils";

export interface CardData {
  headline: string;
  headline2: string;
  subheadline: string;
  bulletText: string;
  quoteText: string;
  dateText: string;
  category: string;
  viaText: string;
  mainPhoto: HTMLImageElement | null;
  secondPhoto: HTMLImageElement | null;
  channelLogo: HTMLImageElement | null;
  otvLogo: HTMLImageElement | null;
  personName: string;
  personTitle: string;
  personName2: string;
  personTitle2: string;
  highlightColor: string;
  highlightWords: string;
  otvLogoX: number;
  otvLogoY: number;
  otvLogoSize: number;
  banglaFont?: string;
  headlineFont?: string;
  imageOffsetX?: number;
  imageOffsetY?: number;
  imageZoom?: number;
  gridEnabled?: boolean;
  grainEnabled?: boolean;
  textureEnabled?: boolean;
  gridIntensity?: number;
  grainIntensity?: number;
  textAlign?: "left" | "center" | "right";
  exportSize?: number;
  colorPreset?: { id: string; name: string; colors: string[]; accent: string };
  bgPreset?: { id: string; name: string; gradientStops: string[]; glowColors: string[] };
  glassStyle?: { id: string; name: string; bgOpacity: number; blurLevel: number; edgeColor: string };
  autoDecorate?: boolean;
  decorPreset?: string;
  emojiDensity?: number;
  glowIntensity?: number;
  blurIntensity?: number;
  transparencyLevel?: number;
  cornerRadius?: number;
  headlineColor?: string;
  subheadlineColor?: string;
  labelColor?: string;
  sourceTextColor?: string;
  badgeColor?: string;
  glassTintColor?: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  nameBn: string;
  previewColors: [string, string];
  accentColor: string;
  defaultCategory: string;
  render: (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void;
}

function bnFont(data: CardData): string {
  return data.banglaFont || BENGALI_FONT;
}

function hlFont(data: CardData): string {
  return data.headlineFont || HEADLINE_FONT;
}

function drawPhoto(ctx: CanvasRenderingContext2D, data: CardData, x: number, y: number, w: number, h: number, radius?: number) {
  if (!data.mainPhoto) return;
  const ox = data.imageOffsetX ?? 0;
  const oy = data.imageOffsetY ?? 0;
  const zoom = data.imageZoom ?? 1;
  if (ox !== 0 || oy !== 0 || zoom !== 1) {
    drawImageCoverPositioned(ctx, data.mainPhoto, x, y, w, h, ox, oy, zoom, radius);
  } else {
    drawImageCover(ctx, data.mainPhoto, x, y, w, h, radius);
  }
}

function drawDarkBg(ctx: CanvasRenderingContext2D, w: number, h: number, c1: string, c2: string) {
  const grad = createGradient(ctx, 0, 0, 0, h, [[0, c1], [1, c2]]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawPurpleGlow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.6);
  grad.addColorStop(0, "rgba(106, 27, 154, 0.15)");
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawOtvWatermark(ctx: CanvasRenderingContext2D, data: CardData) {
  if (!data.otvLogo) return;
  const logo = data.otvLogo;
  const size = data.otvLogoSize ?? 100;
  const cx = data.otvLogoX ?? 600;
  const cy = data.otvLogoY ?? 1140;
  const ratio = Math.min(size / logo.naturalWidth, size / logo.naturalHeight);
  const lw = logo.naturalWidth * ratio;
  const lh = logo.naturalHeight * ratio;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.drawImage(logo, cx - lw / 2, cy - lh / 2, lw, lh);
  ctx.restore();
}

function drawHeadlineWithHighlight(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  fontSize: number,
  mainColor: string,
  highlightColor: string,
  lineHeight: number,
  align: "left" | "center" | "right" = "left",
  fontOverride?: string,
  highlightWords?: string
): number {
  ctx.font = `900 ${fontSize}px ${fontOverride || HEADLINE_FONT}`;
  ctx.textBaseline = "top";
  const displayText = text.toUpperCase();
  const lines = wrapTextLines(ctx, displayText, maxWidth);
  let currentY = y;
  ctx.textAlign = align;

  const hwList = highlightWords
    ? highlightWords.split(",").map(w => w.trim().toUpperCase()).filter(w => w.length > 0)
    : [];

  for (let i = 0; i < lines.length; i++) {
    const words = lines[i].split(" ");
    const wordWidths = words.map(w => ctx.measureText(w).width);
    const spaceW = ctx.measureText(" ").width;
    const totalLineW = wordWidths.reduce((a, b) => a + b, 0) + spaceW * (words.length - 1);

    let startX = x;
    if (align === "center") startX = x - totalLineW / 2;
    else if (align === "right") startX = x + maxWidth - totalLineW;

    let cx = startX;
    for (let j = 0; j < words.length; j++) {
      let isHighlight: boolean;
      if (hwList.length > 0) {
        isHighlight = hwList.some(hw => words[j].includes(hw));
      } else {
        isHighlight = (i === lines.length - 2 && j >= Math.floor(words.length / 2)) ||
          (i === lines.length - 1 && j < Math.ceil(words.length / 2));
      }
      if (isHighlight && hwList.length > 0) {
        ctx.fillStyle = highlightColor + "30";
        roundedRect(ctx, cx - 4, currentY - 2, wordWidths[j] + 8, fontSize + 6, 6);
        ctx.fill();
      }
      ctx.fillStyle = isHighlight ? highlightColor : mainColor;
      ctx.textAlign = "left";
      ctx.fillText(words[j], cx, currentY);
      cx += wordWidths[j] + spaceW;
    }
    currentY += lineHeight;
  }
  return currentY;
}

function drawUserTextures(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.gridEnabled) {
    const intensity = data.gridIntensity ?? 0.5;
    drawEditorialGrid(ctx, 0, 0, w, h * 0.6, 55, `rgba(255,255,255,${0.02 * intensity})`, "down");
  }
  if (data.grainEnabled) {
    const intensity = data.grainIntensity ?? 0.5;
    drawSandyGrain(ctx, w, h, intensity * 0.03);
  }
  if (data.textureEnabled) {
    drawNoiseOverlay(ctx, w, h, 0.02);
  }
}

export const DECOR_PRESETS: Record<string, {
  emojis: string[];
  sparkleCount: number;
  glowColors: string[];
  placementStyle: "corners" | "edges" | "scattered" | "top" | "bottom";
}> = {
  sparkle: {
    emojis: ["\u2728", "\u2B50", "\uD83C\uDF1F", "\u2728"],
    sparkleCount: 18,
    glowColors: ["rgba(255,215,0,0.3)", "rgba(255,255,255,0.2)"],
    placementStyle: "scattered",
  },
  breaking: {
    emojis: ["\uD83D\uDD25", "\u26A1", "\uD83D\uDD25", "\u26A1"],
    sparkleCount: 10,
    glowColors: ["rgba(255,0,0,0.4)", "rgba(255,100,0,0.3)"],
    placementStyle: "edges",
  },
  social: {
    emojis: ["\uD83D\uDC4D", "\u2764\uFE0F", "\uD83D\uDCAF", "\u2728"],
    sparkleCount: 14,
    glowColors: ["rgba(168,85,247,0.3)", "rgba(236,72,153,0.3)"],
    placementStyle: "corners",
  },
  cute: {
    emojis: ["\u2764\uFE0F", "\u2728", "\u2B50", "\u2764\uFE0F"],
    sparkleCount: 20,
    glowColors: ["rgba(255,182,193,0.3)", "rgba(255,218,185,0.25)"],
    placementStyle: "scattered",
  },
  editorial: {
    emojis: ["\u2705", "\u2728", "\u2B50"],
    sparkleCount: 8,
    glowColors: ["rgba(100,150,255,0.2)", "rgba(200,200,200,0.15)"],
    placementStyle: "corners",
  },
  futuristic: {
    emojis: ["\u26A1", "\uD83D\uDCAF", "\u2728", "\u26A1"],
    sparkleCount: 16,
    glowColors: ["rgba(0,255,200,0.3)", "rgba(0,150,255,0.3)"],
    placementStyle: "edges",
  },
  neon: {
    emojis: ["\u2728", "\u2B50", "\uD83C\uDF1F", "\u26A1"],
    sparkleCount: 22,
    glowColors: ["rgba(0,255,255,0.35)", "rgba(255,0,200,0.3)", "rgba(0,255,100,0.25)"],
    placementStyle: "scattered",
  },
  celebration: {
    emojis: ["\u2728", "\u2B50", "\uD83D\uDC51", "\uD83C\uDF1F"],
    sparkleCount: 24,
    glowColors: ["rgba(255,215,0,0.3)", "rgba(255,100,50,0.25)", "rgba(200,0,255,0.2)"],
    placementStyle: "scattered",
  },
  royal: {
    emojis: ["\uD83D\uDC51", "\u2B50", "\u2728", "\uD83D\uDC51"],
    sparkleCount: 16,
    glowColors: ["rgba(255,215,0,0.35)", "rgba(218,165,32,0.3)"],
    placementStyle: "corners",
  },
  love: {
    emojis: ["\u2764\uFE0F", "\u2728", "\u2764\uFE0F", "\uD83C\uDF1F"],
    sparkleCount: 20,
    glowColors: ["rgba(255,20,80,0.3)", "rgba(255,100,150,0.25)"],
    placementStyle: "scattered",
  },
};

export function drawAutoDecorate(
  ctx: CanvasRenderingContext2D,
  data: CardData,
  w: number,
  h: number
) {
  if (!data.autoDecorate) return;

  const presetName = data.decorPreset || "sparkle";
  const preset = DECOR_PRESETS[presetName] || DECOR_PRESETS.sparkle;
  const density = data.emojiDensity ?? 0.5;
  const glowStr = data.glowIntensity ?? 0.5;

  const emojiCount = Math.round(preset.emojis.length * density * 2);
  const sparkleCount = Math.round(preset.sparkleCount * density);

  const safeZone = { x1: w * 0.15, y1: h * 0.15, x2: w * 0.85, y2: h * 0.75 };

  type Pos = { x: number; y: number };
  const positions: Pos[] = [];

  if (preset.placementStyle === "corners") {
    positions.push(
      { x: w * 0.08, y: h * 0.06 },
      { x: w * 0.92, y: h * 0.06 },
      { x: w * 0.08, y: h * 0.92 },
      { x: w * 0.92, y: h * 0.92 },
      { x: w * 0.06, y: h * 0.5 },
      { x: w * 0.94, y: h * 0.5 },
    );
  } else if (preset.placementStyle === "edges") {
    positions.push(
      { x: w * 0.05, y: h * 0.15 },
      { x: w * 0.95, y: h * 0.25 },
      { x: w * 0.05, y: h * 0.85 },
      { x: w * 0.95, y: h * 0.75 },
      { x: w * 0.5, y: h * 0.03 },
      { x: w * 0.5, y: h * 0.97 },
    );
  } else if (preset.placementStyle === "top") {
    positions.push(
      { x: w * 0.1, y: h * 0.05 },
      { x: w * 0.3, y: h * 0.08 },
      { x: w * 0.7, y: h * 0.06 },
      { x: w * 0.9, y: h * 0.09 },
      { x: w * 0.5, y: h * 0.04 },
      { x: w * 0.15, y: h * 0.12 },
    );
  } else if (preset.placementStyle === "bottom") {
    positions.push(
      { x: w * 0.1, y: h * 0.88 },
      { x: w * 0.3, y: h * 0.92 },
      { x: w * 0.7, y: h * 0.9 },
      { x: w * 0.9, y: h * 0.85 },
      { x: w * 0.5, y: h * 0.95 },
      { x: w * 0.2, y: h * 0.82 },
    );
  } else {
    positions.push(
      { x: w * 0.06, y: h * 0.08 },
      { x: w * 0.94, y: h * 0.12 },
      { x: w * 0.08, y: h * 0.88 },
      { x: w * 0.92, y: h * 0.85 },
      { x: w * 0.04, y: h * 0.45 },
      { x: w * 0.96, y: h * 0.55 },
      { x: w * 0.12, y: h * 0.25 },
      { x: w * 0.88, y: h * 0.35 },
    );
  }

  for (let i = 0; i < Math.min(emojiCount, positions.length); i++) {
    const pos = positions[i];
    const emoji = preset.emojis[i % preset.emojis.length];
    const size = 28 + (i % 3) * 10;
    const isInSafeZone = pos.x > safeZone.x1 && pos.x < safeZone.x2 &&
                          pos.y > safeZone.y1 && pos.y < safeZone.y2;
    if (!isInSafeZone) {
      drawDecorativeEmoji(ctx, emoji, pos.x, pos.y, size, 0.5 + density * 0.3, true);
    }
  }

  if (sparkleCount > 0) {
    drawSparkles(ctx, w * 0.02, h * 0.02, w * 0.25, h * 0.2, Math.ceil(sparkleCount / 3), preset.glowColors[0] || "rgba(255,255,255,0.7)");
    drawSparkles(ctx, w * 0.73, h * 0.78, w * 0.25, h * 0.2, Math.ceil(sparkleCount / 3), preset.glowColors[0] || "rgba(255,255,255,0.7)");
    if (sparkleCount > 8) {
      drawSparkles(ctx, w * 0.75, h * 0.02, w * 0.22, h * 0.15, Math.ceil(sparkleCount / 4), preset.glowColors[1] || "rgba(255,255,255,0.5)");
    }
  }

  if (glowStr > 0.3) {
    const ringCount = glowStr > 0.7 ? 2 : 1;
    const ringPositions = [
      { cx: w * 0.1, cy: h * 0.1, r: 35 },
      { cx: w * 0.9, cy: h * 0.9, r: 28 },
    ];
    for (let i = 0; i < ringCount; i++) {
      const rp = ringPositions[i];
      drawGlowRing(ctx, rp.cx, rp.cy, rp.r, preset.glowColors[i % preset.glowColors.length], 2);
    }
  }

  if (density > 0.5 && glowStr > 0.4) {
    drawFloatingOrbs(ctx, w, h, preset.glowColors, Math.round(density * 4));
  }
}

function applyGlassBackground(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number, fallbackColors: string[]) {
  const colors = data.bgPreset?.gradientStops || fallbackColors;
  drawGradientMesh(ctx, w, h, colors);
  if (data.bgPreset?.glowColors) {
    drawGlowBlobs(ctx, w, h, data.bgPreset.glowColors, 4, (data.glowIntensity ?? 0.5) * 0.5);
  }
}

function getGlassRadius(data: CardData, fallback: number): number {
  return data.cornerRadius ?? fallback;
}

function getGlassOpacity(data: CardData, fallback: number): number {
  const base = data.glassStyle?.bgOpacity ?? fallback;
  const trans = data.transparencyLevel ?? 0.5;
  return base * (0.5 + trans * 0.5);
}

function getGlassEdgeColor(data: CardData, fallback: string): string {
  return data.glassStyle?.edgeColor || fallback;
}

function drawSubheadline(ctx: CanvasRenderingContext2D, data: CardData, x: number, y: number, maxWidth: number, color: string): number {
  if (!data.subheadline) return y;
  ctx.font = `600 32px ${bnFont(data)}`;
  ctx.fillStyle = data.subheadlineColor || color;
  ctx.textBaseline = "top";
  return wrapText(ctx, data.subheadline, x, y + 8, maxWidth, 42, data.textAlign || "left") + 12;
}

function drawBulletText(ctx: CanvasRenderingContext2D, data: CardData, x: number, y: number, maxWidth: number, color: string, bulletColor: string): number {
  if (!data.bulletText) return y;
  const bullets = data.bulletText.split("\n").filter(b => b.trim());
  ctx.textBaseline = "top";
  let cy = y + 8;
  for (const bullet of bullets) {
    ctx.font = `700 28px ${bnFont(data)}`;
    ctx.fillStyle = bulletColor;
    ctx.fillText("●", x, cy + 2);
    ctx.fillStyle = color;
    cy = wrapText(ctx, bullet.trim(), x + 30, cy, maxWidth - 30, 38, data.textAlign || "left") + 8;
  }
  return cy;
}

function drawQuoteBlock(ctx: CanvasRenderingContext2D, data: CardData, x: number, y: number, maxWidth: number, quoteColor: string, textColor: string): number {
  if (!data.quoteText) return y;
  ctx.font = `900 72px ${SANS_FONT}`;
  ctx.fillStyle = quoteColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("\u201C", x - 8, y - 20);
  ctx.font = `700 40px ${bnFont(data)}`;
  ctx.fillStyle = textColor;
  const endY = wrapText(ctx, data.quoteText, x + 20, y + 40, maxWidth - 40, 54, "left");
  ctx.font = `900 72px ${SANS_FONT}`;
  ctx.fillStyle = quoteColor;
  ctx.fillText("\u201D", x + maxWidth - 50, endY - 10);
  return endY + 20;
}

function drawDateLine(ctx: CanvasRenderingContext2D, data: CardData, x: number, y: number, color: string) {
  if (!data.dateText) return;
  ctx.font = `600 24px ${SANS_FONT}`;
  ctx.fillStyle = data.sourceTextColor || color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(data.dateText, x, y);
}

function renderJamunaDark(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a0e1f", "#000814");
  drawPurpleGlow(ctx, w, h);
  drawEditorialGrid(ctx, 0, 0, w, h * 0.5, 55, "rgba(100,120,180,0.04)", "down");
  drawNoiseOverlay(ctx, w, h, 0.015);

  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, h * 0.4, w, h * 0.6);
    const overlay = createGradient(ctx, 0, h * 0.32, 0, h * 0.7, [
      [0, "rgba(10, 14, 31, 1)"],
      [0.35, "rgba(10, 14, 31, 0.85)"],
      [0.7, "rgba(10, 14, 31, 0.3)"],
      [1, "transparent"],
    ]);
    ctx.fillStyle = overlay;
    ctx.fillRect(0, h * 0.32, w, h * 0.38);
  }

  drawAccentBar(ctx, 60, h * 0.15, 50, 4, data.highlightColor || "#FFD700", true);
  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawBadge(ctx, data.category, w / 2, h * 0.17, "transparent", data.badgeColor || data.highlightColor || "#FFD700", data.highlightColor || "#FFD700", 32);

  const hlEnd = drawHeadlineWithHighlight(
    ctx, data.headline, 60, h * 0.22, w - 120, 68, data.headlineColor || "#ffffff", data.highlightColor || "#FFD700", 84, "left", hlFont(data), data.highlightWords
  );

  let contentY = drawSubheadline(ctx, data, 60, hlEnd, w - 120, "rgba(255,255,255,0.6)");
  contentY = drawBulletText(ctx, data, 60, contentY, w - 120, data.labelColor || "rgba(255,255,255,0.7)", data.highlightColor || "#FFD700");
  drawDateLine(ctx, data, 60, h - 90, "rgba(255,255,255,0.3)");
  drawUserTextures(ctx, data, w, h);

  drawPhotoCredit(ctx, "Photo \u2014 Collected", 28, h - 60);
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderQuoteCard(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawPaperTexture(ctx, w, h, "#f8f3eb", 0.03);
  drawEditorialGrid(ctx, 0, 0, w, h * 0.5, 45, "rgba(60,50,30,0.035)", "down");
  drawSandyGrain(ctx, w, h, 0.025, true);

  ctx.save();
  ctx.font = `300 280px Georgia, serif`;
  ctx.fillStyle = "rgba(200,168,50,0.08)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("\u201C", 30, -30);
  ctx.restore();

  drawAccentBar(ctx, 60, 55, 50, 5, data.highlightColor || "#FFD700", true);

  const quoteOrHeadline = data.quoteText || data.headline;
  ctx.font = `700 54px ${bnFont(data)}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, quoteOrHeadline, 60, 80, w * 0.55, 72, "left");

  drawAccentBar(ctx, 60, endY + 15, 80, 4, data.highlightColor || "#FFD700");

  ctx.font = `700 30px ${bnFont(data)}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "left";
  ctx.fillText(data.personName || data.category, 60, endY + 35);

  ctx.font = `400 22px ${bnFont(data)}`;
  ctx.fillStyle = "#666";
  ctx.fillText(data.personTitle || data.viaText, 60, endY + 72);
  drawDateLine(ctx, data, 60, endY + 100, "#999");

  if (data.mainPhoto) {
    drawPhoto(ctx, data, w * 0.3, h * 0.48, w * 0.7, h * 0.52, 8);
    const fadeGrad = createGradient(ctx, w * 0.3, h * 0.48, w * 0.42, h * 0.48, [
      [0, "#f8f3eb"], [1, "transparent"]
    ]);
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(w * 0.3, h * 0.48, w * 0.12, h * 0.52);
  }

  drawLogo(ctx, data.channelLogo, 50, h - 80, 140, 55);
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderCleanNews(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawPaperTexture(ctx, w, h, "#f4f2ee", 0.025);
  drawEditorialGrid(ctx, 0, 0, w, h * 0.52, 50, "rgba(50,50,50,0.03)", "down");
  drawSandyGrain(ctx, w, h * 0.52, 0.02, false);

  const accentColor = data.highlightColor || "#FF6D00";
  drawAccentBar(ctx, 60, 55, 6, 50, accentColor, true);

  if (data.channelLogo) {
    drawLogo(ctx, data.channelLogo, w - 120, 40, 70, 70);
  }

  ctx.font = `800 58px ${bnFont(data)}`;
  ctx.fillStyle = "#111111";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 80, 120, w - 140, 74, "left");

  drawAccentBar(ctx, 80, endY + 10, 60, 3, accentColor);
  ctx.font = `400 22px ${SANS_FONT}`;
  ctx.fillStyle = "#888";
  ctx.textAlign = "left";
  ctx.fillText(`${data.viaText} | ${data.category}`, 80, endY + 25);

  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, h * 0.52, w, h * 0.48);
    const fadeTop = createGradient(ctx, 0, h * 0.52, 0, h * 0.56, [
      [0, "#f4f2ee"], [1, "transparent"]
    ]);
    ctx.fillStyle = fadeTop;
    ctx.fillRect(0, h * 0.52, w, h * 0.04);
  }
  drawAccentBar(ctx, 0, h - 4, w, 4, accentColor, true);
  drawOtvWatermark(ctx, data);
}

function renderDualQuote(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w / 2, h);

  drawDarkBg(ctx, w, h, "#1a1a2e", "#0f0f1a");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w / 2, h);

  if (data.channelLogo) {
    drawLogo(ctx, data.channelLogo, 30, 30, 60, 60);
  }

  const halfW = w / 2;
  const leftText = data.headline || "";
  const rightText = data.headline2 || data.headline || "";

  ctx.font = `800 44px ${bnFont(data)}`;
  ctx.fillStyle = "#111";
  ctx.textBaseline = "top";
  const leftEndY = wrapText(ctx, leftText, 40, 120, halfW - 80, 58, "left");

  if (data.personName) {
    ctx.font = `400 22px ${SANS_FONT}`;
    ctx.fillStyle = "#555";
    ctx.fillText(`- ${data.personName}`, 40, leftEndY + 10);
  }
  if (data.personTitle) {
    ctx.font = `400 18px ${SANS_FONT}`;
    ctx.fillStyle = "#888";
    ctx.fillText(data.personTitle, 40, leftEndY + 38);
  }

  ctx.font = `800 44px ${bnFont(data)}`;
  ctx.fillStyle = "#e0e0e0";
  const rightEndY = wrapText(ctx, rightText, halfW + 40, 120, halfW - 80, 58, "left");

  if (data.personName2 || data.personName) {
    ctx.font = `400 22px ${SANS_FONT}`;
    ctx.fillStyle = "#aaa";
    ctx.fillText(`- ${data.personName2 || data.personName}`, halfW + 40, rightEndY + 10);
  }
  if (data.personTitle2 || data.personTitle) {
    ctx.font = `400 18px ${SANS_FONT}`;
    ctx.fillStyle = "#777";
    ctx.fillText(data.personTitle2 || data.personTitle, halfW + 40, rightEndY + 38);
  }

  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.62, halfW, h * 0.38);
  }
  if (data.secondPhoto) {
    drawImageCover(ctx, data.secondPhoto, halfW, h * 0.62, halfW, h * 0.38);
  } else if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, halfW, h * 0.62, halfW, h * 0.38);
  }
  drawOtvWatermark(ctx, data);
}

function renderNationalDark(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0d1117", "#000000");
  drawEditorialGrid(ctx, 0, 0, w, h * 0.45, 50, "rgba(80,120,180,0.03)", "down");
  drawNoiseOverlay(ctx, w, h, 0.012);

  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, h * 0.42, w, h * 0.58);
    const overlay = createGradient(ctx, 0, h * 0.32, 0, h * 0.72, [
      [0, "rgba(13, 17, 23, 1)"],
      [0.4, "rgba(13, 17, 23, 0.8)"],
      [0.7, "rgba(13, 17, 23, 0.3)"],
      [1, "transparent"],
    ]);
    ctx.fillStyle = overlay;
    ctx.fillRect(0, h * 0.32, w, h * 0.4);
  }

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawAccentBar(ctx, 60, h * 0.14, 45, 4, data.highlightColor || "#FFD700", true);
  drawBadge(ctx, data.category, w / 2, h * 0.16, "transparent", data.badgeColor || data.highlightColor || "#FFD700", data.highlightColor || "#FFD700", 30);

  drawHeadlineWithHighlight(
    ctx, data.headline, 60, h * 0.21, w - 120, 62, data.headlineColor || "#ffffff", data.highlightColor || "#FFD700", 78, "left", hlFont(data)
  );

  drawPhotoCredit(ctx, "Image \u2014 Collected", w - 25, h - 60);
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderWorldReport(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const grad = createGradient(ctx, 0, 0, 0, h, [
    [0, "#1a0f00"], [0.3, "#2d1800"], [0.7, "#0d0800"], [1, "#000000"],
  ]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  drawEditorialGrid(ctx, 0, 0, w, h * 0.4, 55, "rgba(200,150,50,0.025)", "down");
  drawNoiseOverlay(ctx, w, h, 0.015);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.5);
  glow.addColorStop(0, "rgba(255, 170, 0, 0.1)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  if (data.mainPhoto) {
    drawPhoto(ctx, data, w * 0.12, h * 0.4, w * 0.76, h * 0.52, 10);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 30;
    ctx.strokeStyle = "rgba(255,200,50,0.15)";
    ctx.lineWidth = 2;
    roundedRect(ctx, w * 0.12, h * 0.4, w * 0.76, h * 0.52, 10);
    ctx.stroke();
    ctx.restore();
  }

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawBadge(ctx, data.category, w / 2, h * 0.16, data.highlightColor || "#FFD700", "#000", undefined, 32);

  drawHeadlineWithHighlight(
    ctx, data.headline, 60, h * 0.22, w - 120, 64, "#ffffff", data.highlightColor || "#FFD700", 80, "left", hlFont(data)
  );

  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderBreakingRed(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const grad = createGradient(ctx, 0, 0, 0, h, [
    [0, "#1a0000"], [0.5, "#2d0a0a"], [1, "#0a0000"],
  ]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  drawEditorialGrid(ctx, 0, 0, w, h * 0.5, 60, "rgba(255,50,50,0.02)", "down");
  drawNoiseOverlay(ctx, w, h, 0.018);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.2, w * 0.5);
  glow.addColorStop(0, "rgba(255, 0, 0, 0.15)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  drawAccentBar(ctx, 0, 0, w, 8, "#cc0000", true);

  drawLogo(ctx, data.channelLogo, 50, 30, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 40);
  drawBadge(ctx, "BREAKING", w / 2, h * 0.14, "#cc0000", "#ffffff", undefined, 38);

  ctx.font = `900 72px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.2, w - 120, 88, "left");

  if (data.mainPhoto) {
    ctx.save();
    ctx.shadowColor = "rgba(200,0,0,0.4)";
    ctx.shadowBlur = 25;
    roundedRect(ctx, w * 0.1, h * 0.52, w * 0.8, h * 0.4, 10);
    ctx.clip();
    drawPhoto(ctx, data, w * 0.1, h * 0.52, w * 0.8, h * 0.4);
    ctx.restore();

    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 3;
    roundedRect(ctx, w * 0.1, h * 0.52, w * 0.8, h * 0.4, 10);
    ctx.stroke();
  }

  drawAccentBar(ctx, 0, h - 5, w, 5, "#cc0000", true);
  drawOtvWatermark(ctx, data);
}

function renderSportsGreen(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const grad = createGradient(ctx, 0, 0, 0, h, [
    [0, "#001a0d"], [0.5, "#002d1a"], [1, "#000a05"],
  ]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  drawEditorialGrid(ctx, 0, 0, w, h * 0.4, 50, "rgba(0,200,100,0.025)", "down");
  drawNoiseOverlay(ctx, w, h, 0.012);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, h * 0.45);
  ctx.lineTo(w, h * 0.35);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.clip();
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, h * 0.3, w, h * 0.7);
  }
  ctx.restore();

  const overlay = createGradient(ctx, 0, h * 0.3, 0, h * 0.7, [
    [0, "rgba(0, 26, 13, 1)"], [0.3, "rgba(0, 26, 13, 0.5)"], [1, "rgba(0, 10, 5, 0.3)"],
  ]);
  ctx.fillStyle = overlay;
  ctx.fillRect(0, h * 0.3, w, h * 0.4);

  ctx.strokeStyle = "#00e676";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.45);
  ctx.lineTo(w, h * 0.35);
  ctx.stroke();

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawBadge(ctx, data.category || "SPORTS", w / 2, h * 0.12, "#00c853", "#ffffff", undefined, 30);
  drawHeadlineWithHighlight(ctx, data.headline, 60, h * 0.17, w - 120, 60, "#ffffff", "#00e676", 76, data.textAlign || "left", hlFont(data), data.highlightWords);
  drawUserTextures(ctx, data, w, h);
  drawAccentBar(ctx, 0, h - 5, w, 5, "#00e676", true);
  drawOtvWatermark(ctx, data);
}

function renderOpinionBlue(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a1628", "#050d1a");
  drawEditorialGrid(ctx, 0, 0, w * 0.6, h, 45, "rgba(60,120,200,0.02)", "none");
  drawNoiseOverlay(ctx, w, h, 0.01);

  const glow = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, w * 0.5);
  glow.addColorStop(0, "rgba(30, 90, 180, 0.12)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.font = `300 200px ${SANS_FONT}`;
  ctx.fillStyle = "rgba(100, 160, 255, 0.06)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("\u201C", 30, 40);

  drawLogo(ctx, data.channelLogo, 50, 40, 130, 50);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawAccentBar(ctx, 60, h * 0.14, 50, 4, "#4a90d9", true);

  ctx.font = `600 48px ${bnFont(data)}`;
  ctx.fillStyle = "#e0e8f5";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 60, h * 0.18, w - 120, 64, "left");
  drawAccentBar(ctx, 60, endY + 10, 70, 3, "#4a90d9", true);

  if (data.personName) {
    ctx.font = `700 30px ${bnFont(data)}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(data.personName, 60, endY + 30);
  }
  if (data.personTitle) {
    ctx.font = `400 22px ${bnFont(data)}`;
    ctx.fillStyle = "#8899bb";
    ctx.fillText(data.personTitle, 60, endY + 68);
  }

  if (data.mainPhoto) {
    ctx.save();
    ctx.shadowColor = "rgba(60,120,220,0.3)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    const cx = w * 0.7;
    const cy = h * 0.72;
    const rx = w * 0.25;
    ctx.arc(cx, cy, rx, 0, Math.PI * 2);
    ctx.clip();
    drawImageCover(ctx, data.mainPhoto, cx - rx, cy - rx, rx * 2, rx * 2);
    ctx.restore();

    ctx.strokeStyle = "rgba(74,144,217,0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.72, w * 0.25, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawAccentBar(ctx, 0, h - 5, w, 5, "#4a90d9", true);
  drawOtvWatermark(ctx, data);
}

function renderInvestigation(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0d0015", "#050008");
  drawEditorialGrid(ctx, 0, 0, w, h * 0.45, 55, "rgba(150,50,200,0.02)", "down");
  drawNoiseOverlay(ctx, w, h, 0.015);

  const spotlight = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.4);
  spotlight.addColorStop(0, "rgba(150, 50, 200, 0.18)");
  spotlight.addColorStop(0.5, "rgba(100, 30, 150, 0.06)");
  spotlight.addColorStop(1, "transparent");
  ctx.fillStyle = spotlight;
  ctx.fillRect(0, 0, w, h);

  if (data.mainPhoto) {
    ctx.globalAlpha = 0.7;
    drawPhoto(ctx, data, w * 0.2, h * 0.45, w * 0.6, h * 0.5, 8);
    ctx.globalAlpha = 1;

    const imgOverlay = createGradient(ctx, 0, h * 0.4, 0, h * 0.75, [
      [0, "rgba(13, 0, 21, 0.9)"], [0.5, "rgba(13, 0, 21, 0.4)"], [1, "rgba(5, 0, 8, 0.6)"],
    ]);
    ctx.fillStyle = imgOverlay;
    ctx.fillRect(w * 0.2, h * 0.45, w * 0.6, h * 0.5);
  }

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawBadge(ctx, data.category || "INVESTIGATION", w / 2, h * 0.15, "#9c27b0", "#ffffff", undefined, 28);
  drawHeadlineWithHighlight(ctx, data.headline, 60, h * 0.2, w - 120, 62, "#e0c0ff", "#d580ff", 78, data.textAlign || "left", hlFont(data), data.highlightWords);
  drawUserTextures(ctx, data, w, h);
  drawPhotoCredit(ctx, "Photo \u2014 Collected", 28, h - 60);
  drawAccentBar(ctx, 0, h - 5, w, 5, "#9c27b0", true);
  drawOtvWatermark(ctx, data);
}

function renderSocialModern(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
  } else {
    drawDarkBg(ctx, w, h, "#1a1a2e", "#000");
  }

  const overlay = createGradient(ctx, 0, 0, 0, h, [
    [0, "rgba(30, 0, 60, 0.85)"], [0.4, "rgba(10, 0, 40, 0.6)"],
    [0.7, "rgba(0, 0, 0, 0.7)"], [1, "rgba(0, 0, 0, 0.95)"],
  ]);
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, w, h);
  drawNoiseOverlay(ctx, w, h, 0.01);

  drawLogo(ctx, data.channelLogo, 50, 50, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 60);
  drawBadge(ctx, data.category, w / 2, h * 0.18, "rgba(255,255,255,0.15)", "#ffffff", "rgba(255,255,255,0.3)", 28);

  ctx.font = `900 70px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(150, 50, 255, 0.5)";
  ctx.shadowBlur = 20;
  wrapText(ctx, data.headline.toUpperCase(), w / 2, h * 0.55, w - 120, 86, "center");
  ctx.shadowBlur = 0;

  if (data.personName) {
    ctx.font = `500 26px ${SANS_FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textAlign = "center";
    ctx.fillText(data.personName, w / 2, h * 0.9);
  }

  drawAccentBar(ctx, 0, h - 5, w, 5, "#a855f7", true);
  drawOtvWatermark(ctx, data);
}

function renderClassicFormal(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a1628", "#060e1a");
  drawEditorialGrid(ctx, 40, 40, w - 80, h - 80, 60, "rgba(212,175,55,0.02)", "none");
  drawNoiseOverlay(ctx, w, h, 0.01);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, 30, 30, w - 60, h - 60, 4);
  ctx.stroke();

  drawLogo(ctx, data.channelLogo, 60, 55, 130, 50);
  drawViaText(ctx, data.viaText, w - 60, 60);
  drawAccentBar(ctx, w / 2 - 40, h * 0.12, 80, 3, "#d4af37", true);
  drawBadge(ctx, data.category, w / 2, h * 0.16, "transparent", "#d4af37", "#d4af37", 28);

  ctx.font = `800 60px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  const endY = wrapText(ctx, data.headline.toUpperCase(), w / 2, h * 0.22, w - 160, 76, "center");
  drawAccentBar(ctx, w / 2 - 40, endY + 5, 80, 3, "#d4af37");

  if (data.mainPhoto) {
    const photoY = Math.max(endY + 25, h * 0.48);
    const photoH = h - photoY - 60;
    ctx.save();
    ctx.shadowColor = "rgba(212,175,55,0.2)";
    ctx.shadowBlur = 15;
    roundedRect(ctx, w * 0.12, photoY, w * 0.76, photoH, 6);
    ctx.clip();
    drawPhoto(ctx, data, w * 0.12, photoY, w * 0.76, photoH);
    ctx.restore();

    ctx.strokeStyle = "rgba(212,175,55,0.3)";
    ctx.lineWidth = 1.5;
    roundedRect(ctx, w * 0.12, photoY, w * 0.76, photoH, 6);
    ctx.stroke();
  }

  drawAccentBar(ctx, 0, h - 5, w, 5, "#d4af37", true);
  drawOtvWatermark(ctx, data);
}

function renderMinimalLight(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawPaperTexture(ctx, w, h, "#ffffff", 0.02);
  drawSandyGrain(ctx, w, h, 0.015, true);

  drawAccentBar(ctx, 0, 0, 8, h, data.highlightColor || "#FFD700", true);

  drawLogo(ctx, data.channelLogo, 40, 40, 130, 50);

  ctx.font = `800 56px ${bnFont(data)}`;
  ctx.fillStyle = "#111";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 40, 120, w * 0.48, 70, "left");

  drawBadge(ctx, data.category, 40 + 60, endY + 30, data.highlightColor || "#FFD700", "#000", undefined, 24);

  ctx.font = `400 20px ${SANS_FONT}`;
  ctx.fillStyle = "#999";
  ctx.textAlign = "left";
  ctx.fillText(data.viaText, 40, endY + 80);

  if (data.mainPhoto) {
    drawPhoto(ctx, data, w * 0.5, 0, w * 0.5, h, 0);
    const edgeGrad = createGradient(ctx, w * 0.5, 0, w * 0.56, 0, [
      [0, "#ffffff"], [1, "transparent"],
    ]);
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(w * 0.5, 0, w * 0.06, h);
  }
  drawAccentBar(ctx, 0, h - 4, w, 4, data.highlightColor || "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderDualQuoteSplit(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const halfW = w / 2;
  ctx.fillStyle = "#5c1a1a";
  ctx.fillRect(0, 0, halfW, h);
  ctx.fillStyle = "#1a4a3a";
  ctx.fillRect(halfW, 0, halfW, h);

  const leftGrad = createGradient(ctx, 0, 0, 0, h, [[0, "#6b1f1f"], [1, "#3d0f0f"]]);
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, halfW, h);
  const rightGrad = createGradient(ctx, halfW, 0, halfW, h, [[0, "#1a5c42"], [1, "#0d3828"]]);
  ctx.fillStyle = rightGrad;
  ctx.fillRect(halfW, 0, halfW, h);

  ctx.font = `700 120px ${SANS_FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("\u201C", 20, 10);
  ctx.fillText("\u201C", halfW + 20, 10);

  ctx.font = `700 42px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  const leftText = data.headline || "";
  const rightText = data.headline2 || data.headline || "";
  const leftEndY = wrapText(ctx, leftText, 45, 100, halfW - 90, 56, "left");
  const rightEndY = wrapText(ctx, rightText, halfW + 45, 100, halfW - 90, 56, "left");

  ctx.fillStyle = data.highlightColor || "#ffc107";
  ctx.fillRect(45, leftEndY + 8, 70, 4);
  ctx.fillRect(halfW + 45, rightEndY + 8, 70, 4);

  ctx.font = `800 28px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  const ln1 = data.personName || "";
  const ln2 = data.personName2 || "";
  if (ln1) ctx.fillText(`\u2014 ${ln1}`, 45, leftEndY + 25);
  if (ln2) ctx.fillText(`\u2014 ${ln2}`, halfW + 45, rightEndY + 25);

  ctx.font = `400 20px ${bnFont(data)}`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  if (data.personTitle) ctx.fillText(data.personTitle, 45, leftEndY + 60);
  if (data.personTitle2) ctx.fillText(data.personTitle2, halfW + 45, rightEndY + 60);

  if (data.mainPhoto) {
    const photoY = h * 0.58;
    const photoH = h * 0.42;
    drawImageCover(ctx, data.mainPhoto, 0, photoY, halfW, photoH);
    const leftOvr = createGradient(ctx, 0, photoY, 0, photoY + photoH * 0.3, [[0, "#3d0f0f"], [1, "transparent"]]);
    ctx.fillStyle = leftOvr;
    ctx.fillRect(0, photoY, halfW, photoH * 0.3);
  }
  if (data.secondPhoto) {
    const photoY = h * 0.58;
    const photoH = h * 0.42;
    drawImageCover(ctx, data.secondPhoto, halfW, photoY, halfW, photoH);
    const rightOvr = createGradient(ctx, halfW, photoY, halfW, photoY + photoH * 0.3, [[0, "#0d3828"], [1, "transparent"]]);
    ctx.fillStyle = rightOvr;
    ctx.fillRect(halfW, photoY, halfW, photoH * 0.3);
  }

  drawOtvWatermark(ctx, data);
}

function renderGridHighlight(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawPaperTexture(ctx, w, h, "#e8e4dc", 0.025);
  drawEditorialGrid(ctx, 0, 0, w, h * 0.42, 35, "rgba(100,120,100,0.08)", "down");
  drawSandyGrain(ctx, w, h, 0.018, true);

  drawAccentBar(ctx, 0, 0, w, 5, "#1a5c42", true);
  drawAccentBar(ctx, 0, 0, 5, h * 0.42, "#1a5c42", true);
  drawAccentBar(ctx, w - 5, 0, 5, h * 0.42, "#1a5c42", true);
  drawAccentBar(ctx, 0, h * 0.42 - 5, w, 5, "#1a5c42", true);

  const endY = drawHighlightedText(
    ctx, data.headline, 50, 50, w - 100, 54, "#1a1a1a", data.highlightColor || "#FFD700", 72, bnFont(data), "left", 16, 8
  );

  ctx.font = `500 22px ${bnFont(data)}`;
  ctx.fillStyle = "#555";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`\u09A4\u09A5\u09CD\u09AF\u09B8\u09C2\u09A4\u09CD\u09B0: ${data.viaText}`, 50, endY + 15);

  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, h * 0.42, w, h * 0.58);
  }

  drawOtvWatermark(ctx, data);
}

function renderQuoteHighlight(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawPaperTexture(ctx, w, h, "#e8e2d8", 0.025);
  drawSandyGrain(ctx, w, h, 0.02, true);

  ctx.font = `700 140px ${SANS_FONT}`;
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("\u201C", 20, 10);

  const endY = drawHighlightedText(
    ctx, data.headline, 50, 100, w - 100, 58, "#1a1a1a", data.highlightColor || "#FFD700", 78, bnFont(data), "left", 14, 8
  );

  ctx.font = `500 22px ${bnFont(data)}`;
  ctx.fillStyle = "#666";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`\u09A4\u09A5\u09CD\u09AF\u09B8\u09C2\u09A4\u09CD\u09B0: ${data.viaText}`, 50, endY + 12);

  drawOtvWatermark(ctx, data);

  if (data.mainPhoto) {
    const photoW = w * 0.55;
    const photoH = h * 0.45;
    const photoX = w - photoW;
    const photoY = h - photoH;
    drawPhoto(ctx, data, photoX, photoY, photoW, photoH);
    const fadeGrad = createGradient(ctx, photoX, photoY, photoX + photoW * 0.3, photoY, [[0, "#e8e2d8"], [1, "transparent"]]);
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(photoX, photoY, photoW * 0.3, photoH);
    const fadeTop = createGradient(ctx, photoX, photoY, photoX, photoY + photoH * 0.2, [[0, "#e8e2d8"], [1, "transparent"]]);
    ctx.fillStyle = fadeTop;
    ctx.fillRect(photoX, photoY, photoW, photoH * 0.2);
  }
}

function renderNewsSummary(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#c8dcc8";
  ctx.fillRect(0, 0, w, h);

  const topGrad = createGradient(ctx, 0, 0, 0, h * 0.15, [[0, "#b0ccb0"], [1, "#c8dcc8"]]);
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, h * 0.15);

  drawGridLines(ctx, 0, 0, w, h * 0.18, 35, "rgba(50,100,70,0.08)");

  const headlineEndY = drawHighlightedText(
    ctx, data.headline, 50, 30, w - 100, 50, "#1a1a1a", data.highlightColor || "#ffc107", 68, bnFont(data), "left", 14, 8
  );

  ctx.font = `500 26px ${bnFont(data)}`;
  ctx.fillStyle = "#333";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  const subText = data.headline2 || data.category;
  wrapText(ctx, subText, 50, headlineEndY + 10, w - 100, 34, "left");

  drawOtvWatermark(ctx, data);

  if (data.mainPhoto) {
    const cr = w * 0.16;
    const cx = 50 + cr;
    const cy = h * 0.58;
    drawCircularImage(ctx, data.mainPhoto, cx, cy, cr, "#1a5c42", 5);
  }

  const bulletX = data.mainPhoto ? w * 0.42 : 60;
  const bulletW = w - bulletX - 50;
  const bulletY = h * 0.43;
  const bulletText = data.headline2 || data.headline;
  const bullets = bulletText.split("\n").filter((b: string) => b.trim());
  let by = bulletY;
  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.arc(bulletX, by + 16, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#1a5c42";
    ctx.fill();

    const endY = drawHighlightedText(
      ctx, bullet, bulletX + 22, by + 2, bulletW - 30, 26, "#1a1a1a", data.highlightColor || "#ffc107", 34, bnFont(data), "left", 8, 4
    );
    by = endY + 12;
  }
}

function makeGradientCard(
  c1: string, c2: string, accent: string, glowColor: string
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    drawDarkBg(ctx, w, h, c1, c2);
    drawEditorialGrid(ctx, 0, 0, w, h * 0.45, 55, `${accent}06`, "down");
    drawNoiseOverlay(ctx, w, h, 0.012);
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.6);
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    if (data.mainPhoto) {
      drawPhoto(ctx, data, 0, h * 0.45, w, h * 0.55);
      const overlay = createGradient(ctx, 0, h * 0.35, 0, h * 0.7, [
        [0, `${c1}`], [0.5, `${c1}aa`], [1, "transparent"],
      ]);
      ctx.fillStyle = overlay;
      ctx.fillRect(0, h * 0.35, w, h * 0.35);
    }
    drawAccentBar(ctx, 60, h * 0.14, 45, 4, accent, true);
    drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
    drawViaText(ctx, data.viaText, w - 50, 50);
    drawBadge(ctx, data.category, w / 2, h * 0.16, "transparent", data.badgeColor || accent, accent, 30);
    const hlEnd = drawHeadlineWithHighlight(ctx, data.headline, 60, h * 0.21, w - 120, 62, data.headlineColor || "#ffffff", accent, 78, data.textAlign || "left", hlFont(data), data.highlightWords);
    drawSubheadline(ctx, data, 60, hlEnd, w - 120, "rgba(255,255,255,0.5)");
    drawUserTextures(ctx, data, w, h);
    drawAccentBar(ctx, 0, h - 5, w, 5, accent, true);
    drawOtvWatermark(ctx, data);
  };
}

function makePhotoOverlayCard(
  overlayStops: [number, string][], accent: string, badgeBg: string, badgeText: string
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    if (data.mainPhoto) {
      drawPhoto(ctx, data, 0, 0, w, h);
    } else {
      drawDarkBg(ctx, w, h, "#111", "#000");
    }
    const overlay = createGradient(ctx, 0, 0, 0, h, overlayStops);
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, w, h);
    drawNoiseOverlay(ctx, w, h, 0.01);
    drawLogo(ctx, data.channelLogo, 50, 50, 140, 55);
    drawViaText(ctx, data.viaText, w - 50, 60);
    drawBadge(ctx, data.category, w / 2, h * 0.15, badgeBg, data.badgeColor || badgeText, undefined, 28);
    ctx.font = `900 66px ${hlFont(data)}`;
    ctx.fillStyle = data.headlineColor || "#ffffff";
    ctx.textBaseline = "top";
    wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.55, w - 120, 82, "left");
    drawAccentBar(ctx, 0, h - 5, w, 5, accent, true);
    drawOtvWatermark(ctx, data);
  };
}

function makeLightCard(
  bg1: string, bg2: string, accent: string, textColor: string
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    drawPaperTexture(ctx, w, h, bg1, 0.025);
    drawEditorialGrid(ctx, 0, 0, w * 0.55, h, 45, "rgba(50,50,50,0.025)", "none");
    drawSandyGrain(ctx, w, h, 0.018, true);
    drawUserTextures(ctx, data, w, h);
    drawLogo(ctx, data.channelLogo, 50, 40, 130, 50);
    drawAccentBar(ctx, 50, 110, 50, 5, accent, true);
    ctx.font = `800 56px ${bnFont(data)}`;
    ctx.fillStyle = data.headlineColor || textColor;
    ctx.textBaseline = "top";
    const endY = wrapText(ctx, data.headline, 50, 135, w * 0.5, 72, "left");
    drawBadge(ctx, data.category, 50 + 60, endY + 20, accent, data.badgeColor || "#000", undefined, 22);
    ctx.font = `400 20px ${SANS_FONT}`;
    ctx.fillStyle = data.sourceTextColor || "#999";
    ctx.textAlign = "left";
    ctx.fillText(data.viaText, 50, endY + 70);
    drawSubheadline(ctx, data, 50, endY + 95, w * 0.48, "#555");
    drawDateLine(ctx, data, 50, h - 80, "#aaa");
    if (data.mainPhoto) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = -4;
      drawPhoto(ctx, data, w * 0.52, 0, w * 0.48, h);
      ctx.restore();
      const edgeGrad = createGradient(ctx, w * 0.52, 0, w * 0.545, 0, [[0, bg1], [1, "transparent"]]);
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(w * 0.52, 0, w * 0.025, h);
    }
    drawAccentBar(ctx, 0, h - 4, w, 4, accent, true);
    drawOtvWatermark(ctx, data);
  };
}

function makeThemedCard(
  c1: string, c2: string, accent: string, glowColor: string, decorFn?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    drawDarkBg(ctx, w, h, c1, c2);
    drawEditorialGrid(ctx, 0, 0, w, h * 0.5, 50, `${accent}08`, "down");
    drawNoiseOverlay(ctx, w, h, 0.012);
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.5);
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    if (decorFn) decorFn(ctx, w, h);
    drawAccentBar(ctx, w / 2 - 30, h * 0.12, 60, 3, accent, true);
    drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
    drawViaText(ctx, data.viaText, w - 50, 50);
    drawBadge(ctx, data.category, w / 2, h * 0.14, accent, data.badgeColor || "#ffffff", undefined, 30);
    const hlEnd = drawHeadlineWithHighlight(ctx, data.headline, 60, h * 0.19, w - 120, 60, data.headlineColor || "#ffffff", accent, 76, data.textAlign || "left", hlFont(data), data.highlightWords);
    drawSubheadline(ctx, data, 60, hlEnd, w - 120, "rgba(255,255,255,0.5)");
    drawUserTextures(ctx, data, w, h);
    if (data.mainPhoto) {
      ctx.save();
      ctx.shadowColor = `${accent}40`;
      ctx.shadowBlur = 20;
      roundedRect(ctx, w * 0.1, h * 0.52, w * 0.8, h * 0.4, 8);
      ctx.clip();
      drawPhoto(ctx, data, w * 0.1, h * 0.52, w * 0.8, h * 0.4);
      ctx.restore();
      ctx.strokeStyle = `${accent}50`;
      ctx.lineWidth = 2;
      roundedRect(ctx, w * 0.1, h * 0.52, w * 0.8, h * 0.4, 8);
      ctx.stroke();
    }
    drawAccentBar(ctx, 0, h - 5, w, 5, accent, true);
    drawOtvWatermark(ctx, data);
  };
}

function makePremiumCard(
  c1: string, c2: string, accent: string, borderAlpha: string, glowColor: string
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    drawDarkBg(ctx, w, h, c1, c2);
    drawEditorialGrid(ctx, 30, 30, w - 60, h - 60, 60, `${accent}05`, "none");
    drawNoiseOverlay(ctx, w, h, 0.01);
    const glow = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.3, h * 0.3, w * 0.5);
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = borderAlpha;
    ctx.lineWidth = 1.5;
    roundedRect(ctx, 25, 25, w - 50, h - 50, 4);
    ctx.stroke();
    drawLogo(ctx, data.channelLogo, 50, 50, 130, 50);
    drawViaText(ctx, data.viaText, w - 50, 55);
    drawAccentBar(ctx, w / 2 - 40, h * 0.13, 80, 3, accent, true);
    drawBadge(ctx, data.category, w / 2, h * 0.17, "transparent", data.badgeColor || accent, accent, 28);
    ctx.font = `800 60px ${hlFont(data)}`;
    ctx.fillStyle = data.headlineColor || "#ffffff";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    const endY = wrapText(ctx, data.headline.toUpperCase(), w / 2, h * 0.23, w - 140, 76, "center");
    drawSubheadline(ctx, data, w / 2, endY + 5, w - 160, "rgba(255,255,255,0.45)");
    drawAccentBar(ctx, w / 2 - 40, endY + 5, 80, 3, accent);
    if (data.mainPhoto) {
      const photoY = Math.max(endY + 20, h * 0.5);
      const photoH = h - photoY - 50;
      ctx.save();
      ctx.shadowColor = `${accent}30`;
      ctx.shadowBlur = 20;
      roundedRect(ctx, w * 0.12, photoY, w * 0.76, photoH, 6);
      ctx.clip();
      drawPhoto(ctx, data, w * 0.12, photoY, w * 0.76, photoH);
      ctx.restore();
      ctx.strokeStyle = `${accent}40`;
      ctx.lineWidth = 1.5;
      roundedRect(ctx, w * 0.12, photoY, w * 0.76, photoH, 6);
      ctx.stroke();
    }
    drawAccentBar(ctx, 0, h - 4, w, 4, accent, true);
    drawOtvWatermark(ctx, data);
  };
}

const renderCrimsonDark = makeGradientCard("#1a0005", "#0a0002", "#ff4444", "rgba(200,0,50,0.12)");
const renderMidnightBlue = makeGradientCard("#000a1a", "#000510", "#4488ff", "rgba(40,80,200,0.12)");
const renderForestDark = makeGradientCard("#001a0a", "#000a05", "#4caf50", "rgba(40,160,60,0.1)");
const renderSunsetOrange = makeGradientCard("#1a0a00", "#0a0500", "#ff9800", "rgba(255,150,0,0.1)");
const renderPurpleHaze = makeGradientCard("#0f001a", "#05000a", "#ba68c8", "rgba(180,80,200,0.12)");
const renderNeonCyan = makeGradientCard("#001a1a", "#000a0a", "#00e5ff", "rgba(0,200,255,0.1)");
const renderRoseGold = makeGradientCard("#1a0a0a", "#0a0505", "#e0a0a0", "rgba(220,160,160,0.1)");
const renderSteelGray = makeGradientCard("#121518", "#08090b", "#90a4ae", "rgba(140,160,180,0.08)");
const renderEmeraldNight = makeGradientCard("#001510", "#000a08", "#00e676", "rgba(0,200,100,0.1)");
const renderCoralDark = makeGradientCard("#1a0808", "#0a0404", "#ff7043", "rgba(255,100,60,0.1)");

const renderPastelPink = makeLightCard("#fff0f5", "#ffe8ef", "#e91e63", "#1a1a1a");
const renderIvoryClean = makeLightCard("#fffff0", "#f5f5dc", "#d4af37", "#111");
const renderSageGreen = makeLightCard("#f0f5f0", "#e0ebe0", "#4caf50", "#1a1a1a");
const renderSkyBlue = makeLightCard("#f0f5ff", "#e0eaff", "#2196f3", "#111");
const renderLavenderLight = makeLightCard("#f5f0ff", "#ece0ff", "#7c4dff", "#1a1a1a");
const renderPeachWarm = makeLightCard("#fff5f0", "#ffe8e0", "#ff7043", "#111");
const renderMintFresh = makeLightCard("#f0fff5", "#e0ffe8", "#26a69a", "#1a1a1a");
const renderCreamClassic = makeLightCard("#faf5e8", "#f0e8d0", "#8d6e63", "#111");
const renderSandWarm = makeLightCard("#f5f0e0", "#e8e0cc", "#bf8f00", "#1a1a1a");
const renderSnowWhite = makeLightCard("#ffffff", "#f5f5f5", "#607d8b", "#111");

const renderPhotoFullOverlay = makePhotoOverlayCard(
  [[0, "rgba(0,0,0,0.3)"], [0.5, "rgba(0,0,0,0.1)"], [0.7, "rgba(0,0,0,0.5)"], [1, "rgba(0,0,0,0.9)"]],
  "#ffc107", "rgba(255,255,255,0.15)", "#ffffff"
);
const renderPhotoBlurBg = makePhotoOverlayCard(
  [[0, "rgba(20,0,40,0.55)"], [0.5, "rgba(10,0,30,0.35)"], [1, "rgba(0,0,0,0.8)"]],
  "#e040fb", "rgba(224,64,251,0.2)", "#ffffff"
);
const renderPhotoCinematic = makePhotoOverlayCard(
  [[0, "rgba(0,0,0,0.1)"], [0.4, "rgba(0,0,0,0)"], [0.6, "rgba(0,0,0,0.3)"], [1, "rgba(0,0,0,0.9)"]],
  "#ff9800", "#ff9800", "#000000"
);
const renderPhotoMagazine = makePhotoOverlayCard(
  [[0, "rgba(0,0,0,0.5)"], [0.3, "rgba(0,0,0,0.1)"], [0.7, "rgba(0,0,0,0.1)"], [1, "rgba(0,0,0,0.75)"]],
  "#ffffff", "#ffffff", "#000000"
);
const renderPhotoEditorial = makePhotoOverlayCard(
  [[0, "rgba(0,0,50,0.4)"], [0.5, "rgba(0,0,30,0.15)"], [1, "rgba(0,0,0,0.8)"]],
  "#4fc3f7", "rgba(79,195,247,0.2)", "#ffffff"
);

function renderPhotoPortrait(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a0a14", "#000");
  drawNoiseOverlay(ctx, w, h, 0.01);
  if (data.mainPhoto) {
    const photoW = w * 0.55;
    drawPhoto(ctx, data, w - photoW, 0, photoW, h);
    const fade = createGradient(ctx, w - photoW, 0, w - photoW + photoW * 0.4, 0, [
      [0, "#0a0a14"], [1, "transparent"],
    ]);
    ctx.fillStyle = fade;
    ctx.fillRect(w - photoW, 0, photoW * 0.4, h);
  }
  drawLogo(ctx, data.channelLogo, 40, 40, 130, 50);
  drawAccentBar(ctx, 40, 120, 50, 4, "#FFD700", true);
  ctx.font = `800 52px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline, 40, 140, w * 0.45, 66, "left");
  if (data.personName) {
    ctx.font = `600 26px ${bnFont(data)}`;
    ctx.fillStyle = "#ffc107";
    ctx.textAlign = "left";
    ctx.fillText(data.personName, 40, h - 120);
  }
  if (data.personTitle) {
    ctx.font = `400 20px ${SANS_FONT}`;
    ctx.fillStyle = "#aaa";
    ctx.textAlign = "left";
    ctx.fillText(data.personTitle, 40, h - 88);
  }
  drawAccentBar(ctx, 0, h - 5, w, 5, "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderPhotoPanorama(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h * 0.6);
  }
  drawDarkBg(ctx, w, h * 0.45, "#0d1117", "#000000");
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  const fade = createGradient(ctx, 0, h * 0.5, 0, h * 0.6, [[0, "transparent"], [1, "#0d1117"]]);
  ctx.fillStyle = fade;
  ctx.fillRect(0, h * 0.5, w, h * 0.1);
  drawNoiseOverlay(ctx, w, h, 0.01);
  drawLogo(ctx, data.channelLogo, 50, h * 0.58, 130, 50);
  drawViaText(ctx, data.viaText, w - 50, h * 0.6);
  ctx.font = `900 60px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 50, h * 0.66, w - 100, 74, "left");
  drawAccentBar(ctx, 0, h - 5, w, 5, "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderPhotoVignette(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
  } else {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, w, h);
  }
  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  const bottomFade = createGradient(ctx, 0, h * 0.6, 0, h, [[0, "transparent"], [1, "rgba(0,0,0,0.9)"]]);
  ctx.fillStyle = bottomFade;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
  drawLogo(ctx, data.channelLogo, 50, 50, 140, 55);
  drawBadge(ctx, data.category, w / 2, h * 0.12, "rgba(0,0,0,0.5)", "#ffffff", "rgba(255,255,255,0.3)", 26);
  ctx.font = `900 64px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.7, w - 120, 80, "left");
  drawAccentBar(ctx, 0, h - 5, w, 5, "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderPhotoDuotone(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
  }
  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = "#1a237e";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  const overlay = createGradient(ctx, 0, 0, 0, h, [
    [0, "rgba(26,35,126,0.5)"], [0.6, "rgba(0,0,0,0.3)"], [1, "rgba(0,0,0,0.85)"],
  ]);
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, w, h);
  drawLogo(ctx, data.channelLogo, 50, 50, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 60);
  ctx.font = `900 66px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.6, w - 120, 82, "left");
  drawAccentBar(ctx, 0, h - 5, w, 5, "#7c4dff", true);
  drawOtvWatermark(ctx, data);
}

function renderPhotoVintage(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
  }
  ctx.fillStyle = "rgba(120,80,30,0.25)";
  ctx.fillRect(0, 0, w, h);
  const overlay = createGradient(ctx, 0, 0, 0, h, [
    [0, "rgba(40,30,10,0.6)"], [0.5, "rgba(30,20,5,0.3)"], [1, "rgba(20,10,0,0.85)"],
  ]);
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, w, h);
  drawLogo(ctx, data.channelLogo, 50, 50, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 60, "#e8d5b0");
  ctx.font = `900 62px ${hlFont(data)}`;
  ctx.fillStyle = "#f5e6c8";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.6, w - 120, 78, "left");
  drawAccentBar(ctx, 0, h - 5, w, 5, "#d4af37", true);
  drawOtvWatermark(ctx, data);
}

const renderRamadanGreen = makeThemedCard("#001a0d", "#000a05", "#2e7d32", "rgba(46,125,50,0.1)", (ctx, w, h) => {
  ctx.font = `200 180px ${SANS_FONT}`;
  ctx.fillStyle = "rgba(46,125,50,0.06)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("\u262A", w / 2, h * 0.02);
});
const renderEidGold = makeThemedCard("#1a1400", "#0a0a00", "#ffd700", "rgba(255,215,0,0.08)");
const renderVictoryRed = makeThemedCard("#1a0000", "#0a0000", "#d32f2f", "rgba(211,47,47,0.1)", (ctx, w, h) => {
  ctx.fillStyle = "rgba(211,47,47,0.05)";
  ctx.fillRect(0, 0, w, 8);
  ctx.fillRect(0, h - 8, w, 8);
});
const renderIndependenceGreen = makeThemedCard("#002d0a", "#001505", "#1b5e20", "rgba(27,94,32,0.12)", (ctx, w, h) => {
  ctx.fillStyle = "#1b5e20";
  ctx.fillRect(0, 0, w, 6);
});
const renderElectionBlue = makeThemedCard("#000a1a", "#000510", "#1565c0", "rgba(21,101,192,0.1)");
const renderWeatherCyan = makeThemedCard("#001520", "#000a10", "#00acc1", "rgba(0,172,193,0.1)");
const renderHealthGreen = makeThemedCard("#001510", "#000a08", "#43a047", "rgba(67,160,71,0.1)");
const renderTechBlue = makeThemedCard("#000818", "#00040c", "#1e88e5", "rgba(30,136,229,0.1)");
const renderEconomyGold = makeThemedCard("#1a1200", "#0a0900", "#f9a825", "rgba(249,168,37,0.08)");
const renderEducationPurple = makeThemedCard("#0a0018", "#05000c", "#7b1fa2", "rgba(123,31,162,0.1)");

function renderGlassCard(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, w, h);
  } else {
    drawDarkBg(ctx, w, h, "#0a1628", "#060e1a");
  }
  const panelX = w * 0.08, panelY = h * 0.08, panelW = w * 0.84, panelH = h * 0.84;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundedRect(ctx, panelX, panelY, panelW, panelH, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, panelX, panelY, panelW, panelH, 16);
  ctx.stroke();
  drawLogo(ctx, data.channelLogo, panelX + 20, panelY + 20, 120, 45);
  drawViaText(ctx, data.viaText, panelX + panelW - 20, panelY + 25);
  drawBadge(ctx, data.category, w / 2, panelY + panelH * 0.18, "rgba(255,255,255,0.1)", "#ffffff", "rgba(255,255,255,0.2)", 26);
  ctx.font = `800 58px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  wrapText(ctx, data.headline.toUpperCase(), w / 2, panelY + panelH * 0.28, panelW - 60, 72, "center");
  drawAccentBar(ctx, 0, h - 5, w, 5, "#FFD700", true);
  drawOtvWatermark(ctx, data);
}

function renderNeonGlow(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  const neonColors = ["rgba(0,255,200,0.06)", "rgba(255,0,150,0.04)", "rgba(0,100,255,0.05)"];
  for (let i = 0; i < 3; i++) {
    const gx = w * (0.2 + i * 0.3), gy = h * (0.3 + i * 0.1);
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.4);
    g.addColorStop(0, neonColors[i]);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, h * 0.5, w, h * 0.5);
    const imgFade = createGradient(ctx, 0, h * 0.45, 0, h * 0.65, [[0, "#000"], [1, "transparent"]]);
    ctx.fillStyle = imgFade;
    ctx.fillRect(0, h * 0.45, w, h * 0.2);
  }
  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  ctx.font = `900 66px ${hlFont(data)}`;
  ctx.fillStyle = "#00ffc8";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,255,200,0.6)";
  ctx.shadowBlur = 25;
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.2, w - 120, 82, "left");
  ctx.shadowBlur = 0;
  drawAccentBar(ctx, 0, h - 5, w, 5, "#00ffc8", true);
  drawOtvWatermark(ctx, data);
}

function renderGradientMesh(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a0a2e", "#050514");
  const colors = [
    { x: 0.2, y: 0.2, c: "rgba(255,0,100,0.08)" },
    { x: 0.8, y: 0.3, c: "rgba(0,150,255,0.08)" },
    { x: 0.5, y: 0.8, c: "rgba(150,0,255,0.06)" },
  ];
  for (const { x, y, c } of colors) {
    const g = ctx.createRadialGradient(w * x, h * y, 0, w * x, h * y, w * 0.5);
    g.addColorStop(0, c);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, h * 0.48, w, h * 0.52);
    const imgFade = createGradient(ctx, 0, h * 0.42, 0, h * 0.6, [[0, "#0a0a2e"], [1, "transparent"]]);
    ctx.fillStyle = imgFade;
    ctx.fillRect(0, h * 0.42, w, h * 0.18);
  }
  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawBadge(ctx, data.category, w / 2, h * 0.15, "rgba(255,255,255,0.1)", "#ffffff", "rgba(255,255,255,0.2)", 28);
  drawUserTextures(ctx, data, w, h);
  drawHeadlineWithHighlight(ctx, data.headline, 60, h * 0.2, w - 120, 62, "#ffffff", "#ff6ec7", 78, data.textAlign || "left", hlFont(data), data.highlightWords);
  drawAccentBar(ctx, 0, h - 5, w, 5, "#ff6ec7", true);
  drawOtvWatermark(ctx, data);
}

function renderPaperTexture(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawPaperTexture(ctx, w, h, "#f0e8d8", 0.03);
  drawSandyGrain(ctx, w, h, 0.02, true);
  drawLogo(ctx, data.channelLogo, 50, 40, 130, 50);
  drawAccentBar(ctx, 50, 110, 50, 4, "#8d6e63", true);
  ctx.font = `800 56px ${bnFont(data)}`;
  ctx.fillStyle = "#2c1810";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 50, 130, w - 100, 70, "left");
  drawBadge(ctx, data.category, 50 + 60, endY + 20, "#8d6e63", "#f0e8d8", undefined, 22);
  ctx.font = `400 20px ${SANS_FONT}`;
  ctx.fillStyle = "#8d6e63";
  ctx.textAlign = "left";
  ctx.fillText(data.viaText, 50, endY + 70);
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, h * 0.55, w, h * 0.45);
    const fadeTop = createGradient(ctx, 0, h * 0.55, 0, h * 0.62, [[0, "#f0e8d8"], [1, "transparent"]]);
    ctx.fillStyle = fadeTop;
    ctx.fillRect(0, h * 0.55, w, h * 0.07);
  }
  drawOtvWatermark(ctx, data);
}

const renderFilmGrain = makePhotoOverlayCard(
  [[0, "rgba(0,0,0,0.5)"], [0.3, "rgba(0,0,0,0.1)"], [0.7, "rgba(0,0,0,0.2)"], [1, "rgba(0,0,0,0.8)"]],
  "#e0e0e0", "rgba(255,255,255,0.2)", "#ffffff"
);

function renderRetroWave(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const grad = createGradient(ctx, 0, 0, 0, h, [[0, "#0f0030"], [0.5, "#1a0050"], [1, "#050015"]]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const sunGrad = ctx.createRadialGradient(w / 2, h * 0.65, 0, w / 2, h * 0.65, w * 0.35);
  sunGrad.addColorStop(0, "rgba(255,100,50,0.2)");
  sunGrad.addColorStop(0.5, "rgba(255,50,100,0.1)");
  sunGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,0,200,0.15)";
  ctx.lineWidth = 1;
  for (let i = h * 0.6; i < h; i += 25) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
  }
  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  ctx.font = `900 66px ${hlFont(data)}`;
  ctx.fillStyle = "#ff6ec7";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(255,110,199,0.5)";
  ctx.shadowBlur = 20;
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.15, w - 120, 82, "left");
  ctx.shadowBlur = 0;
  if (data.mainPhoto) {
    ctx.save();
    roundedRect(ctx, w * 0.2, h * 0.5, w * 0.6, h * 0.4, 8);
    ctx.clip();
    drawPhoto(ctx, data, w * 0.2, h * 0.5, w * 0.6, h * 0.4);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,110,199,0.5)";
    ctx.lineWidth = 2;
    roundedRect(ctx, w * 0.2, h * 0.5, w * 0.6, h * 0.4, 8);
    ctx.stroke();
  }
  drawAccentBar(ctx, 0, h - 5, w, 5, "#ff6ec7", true);
  drawOtvWatermark(ctx, data);
}

const renderLuxuryBlack = makePremiumCard("#0a0a0a", "#000000", "#d4af37", "rgba(212,175,55,0.15)", "rgba(212,175,55,0.08)");
const renderRoyalPurple = makePremiumCard("#0f0020", "#050010", "#9c27b0", "rgba(156,39,176,0.2)", "rgba(156,39,176,0.1)");
const renderFireRed = makePremiumCard("#1a0000", "#0a0000", "#ff1744", "rgba(255,23,68,0.15)", "rgba(255,23,68,0.08)");
const renderOceanDeep = makePremiumCard("#001030", "#000818", "#0288d1", "rgba(2,136,209,0.2)", "rgba(2,136,209,0.1)");

function renderGlassHeadline(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const colors = data.colorPreset?.colors || ["#0a0a2e", "#1a0040", "#00204a", "#0a0020"];
  applyGlassBackground(ctx, data, w, h, colors);
  drawGlowBlobs(ctx, w, h, ["rgba(100,50,255,0.15)", "rgba(0,180,255,0.12)", "rgba(255,50,150,0.1)"], 5, (data.glowIntensity ?? 0.5) * 0.6);
  drawNoiseOverlay(ctx, w, h, 0.01);

  const r = getGlassRadius(data, 20);
  const panelX = 50, panelY = h * 0.18, panelW = w - 100, panelH = h * 0.55;
  drawGlassPanel(ctx, panelX, panelY, panelW, panelH, r, {
    bgColor: data.glassTintColor || "rgba(255,255,255,0.08)",
    opacity: getGlassOpacity(data, 0.12),
    edgeGlow: true,
    glossyStreak: true,
  });
  drawGlassReflection(ctx, panelX, panelY, panelW, panelH, r);

  drawLogo(ctx, data.channelLogo, 60, 40, 140, 55);
  drawViaText(ctx, data.viaText, w - 60, 50);

  drawGlassBadge(ctx, data.category, w / 2, panelY + 50, "rgba(255,255,255,0.15)", data.badgeColor || "#ffffff", "rgba(100,150,255,0.5)", 28);

  ctx.font = `900 64px ${hlFont(data)}`;
  ctx.fillStyle = data.headlineColor || "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  const endY = wrapText(ctx, data.headline.toUpperCase(), w / 2, panelY + 100, panelW - 80, 80, "center");

  if (data.subheadline) {
    ctx.font = `500 30px ${bnFont(data)}`;
    ctx.fillStyle = data.subheadlineColor || "rgba(255,255,255,0.6)";
    wrapText(ctx, data.subheadline, w / 2, endY + 10, panelW - 100, 40, "center");
  }

  if (data.mainPhoto) {
    drawPhoto(ctx, data, w * 0.15, h * 0.76, w * 0.7, h * 0.2, 12);
    drawGlassEdge(ctx, w * 0.15, h * 0.76, w * 0.7, h * 0.2, 12, "rgba(255,255,255,0.2)");
  }

  drawSparkles(ctx, 0, 0, w, h, 15, "rgba(255,255,255,0.7)");
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#7c4dff", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassPhotoOverlay(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, w, h);
  } else {
    drawGradientMesh(ctx, w, h, ["#0a0a2e", "#1a0040", "#000a20"]);
  }

  drawGlowBlobs(ctx, w, h, ["rgba(0,100,255,0.08)", "rgba(255,0,150,0.06)"], 3, (data.glowIntensity ?? 0.5) * 0.4);

  const r = getGlassRadius(data, 18);
  const panelX = 40, panelY = h * 0.55, panelW = w - 80, panelH = h * 0.38;
  drawGlassPanel(ctx, panelX, panelY, panelW, panelH, r, {
    bgColor: data.glassTintColor || "rgba(0,0,0,0.3)",
    opacity: getGlassOpacity(data, 0.2),
    edgeGlow: true,
    glossyStreak: true,
  });
  drawGlassReflection(ctx, panelX, panelY, panelW, panelH, r);

  drawLogo(ctx, data.channelLogo, 50, 40, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 50);

  drawGlassBadge(ctx, data.category, w / 2, h * 0.12, "rgba(255,255,255,0.2)", data.badgeColor || "#ffffff", "rgba(255,255,255,0.4)", 26);

  ctx.font = `900 58px ${hlFont(data)}`;
  ctx.fillStyle = data.headlineColor || "#ffffff";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline.toUpperCase(), panelX + 30, panelY + 30, panelW - 60, 72, "left");

  if (data.subheadline) {
    ctx.font = `500 26px ${bnFont(data)}`;
    ctx.fillStyle = data.subheadlineColor || "rgba(255,255,255,0.65)";
    wrapText(ctx, data.subheadline, panelX + 30, endY + 5, panelW - 60, 34, "left");
  }

  drawSparkles(ctx, panelX, panelY, panelW, panelH, 10, "rgba(255,255,255,0.6)");
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#00b0ff", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassQuote(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  applyGlassBackground(ctx, data, w, h, ["#0a1a2e", "#001030", "#0a0a28", "#000820"]);
  drawGlowBlobs(ctx, w, h, ["rgba(50,100,200,0.12)", "rgba(100,200,255,0.08)"], 3, (data.glowIntensity ?? 0.5) * 0.5);
  drawNoiseOverlay(ctx, w, h, 0.008);

  const r = getGlassRadius(data, 24);
  const panelX = 60, panelY = h * 0.12, panelW = w - 120, panelH = h * 0.7;
  drawGlassPanel(ctx, panelX, panelY, panelW, panelH, r, {
    bgColor: "rgba(255,255,255,0.06)",
    opacity: getGlassOpacity(data, 0.1),
    edgeGlow: true,
    glossyStreak: true,
  });
  drawGlassReflection(ctx, panelX, panelY, panelW, panelH, r);

  ctx.save();
  ctx.font = `300 200px Georgia, serif`;
  ctx.fillStyle = "rgba(100,180,255,0.1)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("\u201C", panelX + 20, panelY + 10);
  ctx.restore();

  const quoteText = data.quoteText || data.headline;
  ctx.font = `700 48px ${bnFont(data)}`;
  ctx.fillStyle = data.headlineColor || "#e8f0ff";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, quoteText, panelX + 50, panelY + 100, panelW - 100, 64, "left");

  ctx.save();
  ctx.font = `300 200px Georgia, serif`;
  ctx.fillStyle = "rgba(100,180,255,0.1)";
  ctx.textAlign = "right";
  ctx.fillText("\u201D", panelX + panelW - 20, endY - 40);
  ctx.restore();

  drawAccentBar(ctx, panelX + 50, endY + 20, 80, 3, data.highlightColor || "#4fc3f7", true);

  if (data.personName) {
    ctx.font = `700 28px ${bnFont(data)}`;
    ctx.fillStyle = data.labelColor || "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(data.personName, panelX + 50, endY + 40);
  }
  if (data.personTitle) {
    ctx.font = `400 22px ${SANS_FONT}`;
    ctx.fillStyle = data.sourceTextColor || "rgba(255,255,255,0.5)";
    ctx.fillText(data.personTitle, panelX + 50, endY + 74);
  }

  drawLogo(ctx, data.channelLogo, 50, h - 80, 130, 50);
  drawSparkles(ctx, 0, 0, w, h * 0.15, 8, "rgba(150,200,255,0.5)");
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#4fc3f7", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassBreaking(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  applyGlassBackground(ctx, data, w, h, ["#1a0000", "#2a0500", "#1a0a00", "#0a0000"]);
  drawGlowBlobs(ctx, w, h, ["rgba(255,0,0,0.15)", "rgba(255,100,0,0.12)", "rgba(255,50,50,0.1)"], 4, (data.glowIntensity ?? 0.5) * 0.7);
  drawNoiseOverlay(ctx, w, h, 0.015);

  drawAccentBar(ctx, 0, 0, w, 6, "#ff1744", true);
  const r = getGlassRadius(data, 16);

  const alertPanelW = w * 0.5, alertPanelH = 60;
  drawGlassPanel(ctx, w / 2 - alertPanelW / 2, 30, alertPanelW, alertPanelH, 30, {
    bgColor: "rgba(255,0,0,0.25)",
    opacity: getGlassOpacity(data, 0.3),
    edgeGlow: true,
    glossyStreak: true,
  });
  ctx.font = `900 32px ${SANS_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BREAKING NEWS", w / 2, 60);

  drawLogo(ctx, data.channelLogo, 50, 110, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 120);

  const mainPanelX = 40, mainPanelY = h * 0.2, mainPanelW = w - 80, mainPanelH = h * 0.45;
  drawGlassPanel(ctx, mainPanelX, mainPanelY, mainPanelW, mainPanelH, r, {
    bgColor: "rgba(255,30,30,0.08)",
    opacity: getGlassOpacity(data, 0.12),
    edgeGlow: true,
    glossyStreak: true,
  });

  ctx.font = `900 66px ${hlFont(data)}`;
  ctx.fillStyle = data.headlineColor || "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), mainPanelX + 30, mainPanelY + 30, mainPanelW - 60, 82, "left");

  if (data.mainPhoto) {
    drawPhoto(ctx, data, w * 0.1, h * 0.7, w * 0.8, h * 0.25, 10);
    drawGlassEdge(ctx, w * 0.1, h * 0.7, w * 0.8, h * 0.25, 10, "rgba(255,50,50,0.3)");
  }

  drawGlowRing(ctx, w * 0.9, h * 0.15, 30, "rgba(255,0,0,0.4)", 2);
  drawGlowRing(ctx, w * 0.08, h * 0.85, 20, "rgba(255,100,0,0.3)", 2);
  drawAccentBar(ctx, 0, h - 5, w, 5, "#ff1744", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassPortrait(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const colors = data.colorPreset?.colors || ["#0a0020", "#1a0040", "#000a30"];
  applyGlassBackground(ctx, data, w, h, colors);
  drawGlowBlobs(ctx, w, h, ["rgba(120,50,255,0.12)", "rgba(255,100,200,0.08)"], 3, (data.glowIntensity ?? 0.5) * 0.5);
  drawNoiseOverlay(ctx, w, h, 0.008);

  if (data.mainPhoto) {
    const photoR = Math.min(w, h) * 0.18;
    const photoCx = w / 2, photoCy = h * 0.3;

    ctx.save();
    ctx.shadowColor = "rgba(120,50,255,0.4)";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(photoCx, photoCy, photoR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    drawCircularImage(ctx, data.mainPhoto, photoCx, photoCy, photoR, "rgba(255,255,255,0.3)", 3);
    drawGlowRing(ctx, photoCx, photoCy, photoR + 15, "rgba(150,100,255,0.2)", 1.5);
  }

  const namePanelW = w * 0.7, namePanelH = 180;
  const namePanelX = (w - namePanelW) / 2, namePanelY = h * 0.48;
  drawGlassPanel(ctx, namePanelX, namePanelY, namePanelW, namePanelH, getGlassRadius(data, 16), {
    bgColor: "rgba(255,255,255,0.06)",
    opacity: getGlassOpacity(data, 0.1),
    edgeGlow: true,
    glossyStreak: true,
  });

  ctx.font = `800 40px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(data.personName || data.headline, w / 2, namePanelY + 30);

  if (data.personTitle) {
    ctx.font = `400 24px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(data.personTitle, w / 2, namePanelY + 80);
  }

  if (data.subheadline) {
    ctx.font = `500 26px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    wrapText(ctx, data.subheadline, w / 2, namePanelY + 120, namePanelW - 60, 34, "center");
  }

  if (data.quoteText) {
    const quotePanelY = h * 0.7;
    drawGlassPanel(ctx, 60, quotePanelY, w - 120, h * 0.2, 12, {
      bgColor: "rgba(255,255,255,0.04)",
      opacity: 0.08,
    });
    ctx.font = `600 28px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    wrapText(ctx, `\u201C${data.quoteText}\u201D`, w / 2, quotePanelY + 20, w - 200, 38, "center");
  }

  drawLogo(ctx, data.channelLogo, 50, 40, 130, 50);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#b388ff", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassEditorial(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  applyGlassBackground(ctx, data, w, h, ["#0a0a18", "#101028", "#08081a"]);
  drawEditorialGrid(ctx, 0, 0, w, h, 60, "rgba(100,120,200,0.03)", "down");
  drawNoiseOverlay(ctx, w, h, 0.01);

  const topPanelH = h * 0.08;
  drawGlassPanel(ctx, 0, 0, w, topPanelH, 0, {
    bgColor: "rgba(255,255,255,0.05)",
    opacity: 0.08,
    edgeGlow: false,
    glossyStreak: false,
  });
  drawLogo(ctx, data.channelLogo, 30, topPanelH / 2 - 22, 120, 44);
  drawViaText(ctx, data.viaText, w - 30, topPanelH / 2 - 10);

  drawGlassBadge(ctx, data.category, w / 2, topPanelH + 40, "rgba(255,255,255,0.1)", "#ffffff", "rgba(100,150,255,0.3)", 24);

  const leftPanelW = w * 0.48, rightPanelW = w * 0.44;
  const contentY = h * 0.15;

  drawGlassPanel(ctx, 30, contentY, leftPanelW, h * 0.5, 14, {
    bgColor: "rgba(255,255,255,0.05)",
    opacity: 0.08,
    edgeGlow: true,
    glossyStreak: true,
  });

  ctx.font = `800 50px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  const hlEnd = wrapText(ctx, data.headline.toUpperCase(), 55, contentY + 25, leftPanelW - 50, 62, "left");

  if (data.subheadline) {
    ctx.font = `500 26px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    wrapText(ctx, data.subheadline, 55, hlEnd + 10, leftPanelW - 50, 34, "left");
  }

  if (data.mainPhoto) {
    const rightX = w - rightPanelW - 30;
    drawPhoto(ctx, data, rightX, contentY, rightPanelW, h * 0.5, 14);
    drawGlassEdge(ctx, rightX, contentY, rightPanelW, h * 0.5, 14, "rgba(255,255,255,0.15)");
  }

  const bottomY = h * 0.72;
  drawGlassPanel(ctx, 30, bottomY, w - 60, h * 0.2, 12, {
    bgColor: "rgba(255,255,255,0.04)",
    opacity: 0.06,
    edgeGlow: true,
  });

  if (data.bulletText) {
    drawBulletText(ctx, data, 55, bottomY + 15, w - 120, "rgba(255,255,255,0.7)", data.highlightColor || "#82b1ff");
  } else if (data.quoteText) {
    ctx.font = `600 26px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    wrapText(ctx, data.quoteText, 55, bottomY + 20, w - 120, 34, "left");
  }

  drawDateLine(ctx, data, 55, h - 60, "rgba(255,255,255,0.3)");
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#82b1ff", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassGlowPoster(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  if (data.bgPreset?.gradientStops) applyGlassBackground(ctx, data, w, h, ["#000"]);
  drawGlowBlobs(ctx, w, h, [
    "rgba(0,255,200,0.12)", "rgba(255,0,180,0.1)", "rgba(0,100,255,0.1)", "rgba(255,200,0,0.06)"
  ], 6, (data.glowIntensity ?? 0.5) * 0.8);
  drawNoiseOverlay(ctx, w, h, 0.012);
  drawFloatingOrbs(ctx, w, h, ["rgba(0,255,200,0.15)", "rgba(255,0,180,0.12)", "rgba(0,150,255,0.15)"], 6);

  const r = getGlassRadius(data, 20);
  const panelX = 50, panelY = h * 0.25, panelW = w - 100, panelH = h * 0.45;
  drawGlassPanel(ctx, panelX, panelY, panelW, panelH, r, {
    bgColor: "rgba(0,0,0,0.3)",
    opacity: getGlassOpacity(data, 0.15),
    edgeGlow: true,
    glossyStreak: true,
  });
  drawGlassReflection(ctx, panelX, panelY, panelW, panelH, r);

  drawLogo(ctx, data.channelLogo, 50, 40, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 50);

  drawGlassBadge(ctx, data.category, w / 2, panelY + 40, "rgba(0,255,200,0.2)", "#00ffc8", "rgba(0,255,200,0.5)", 26);

  ctx.font = `900 60px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,255,200,0.3)";
  ctx.shadowBlur = 15;
  const endY = wrapText(ctx, data.headline.toUpperCase(), panelX + 30, panelY + 90, panelW - 60, 76, "left");
  ctx.shadowBlur = 0;

  if (data.subheadline) {
    ctx.font = `500 28px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    wrapText(ctx, data.subheadline, panelX + 30, endY + 5, panelW - 60, 36, "left");
  }

  if (data.mainPhoto) {
    drawPhoto(ctx, data, w * 0.12, h * 0.75, w * 0.76, h * 0.2, 10);
    drawGlassEdge(ctx, w * 0.12, h * 0.75, w * 0.76, h * 0.2, 10, "rgba(0,255,200,0.2)");
  }

  drawAccentBar(ctx, 0, h - 5, w, 5, "#00ffc8", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassInfo(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  applyGlassBackground(ctx, data, w, h, ["#0a1020", "#081828", "#0a0a20"]);
  drawGlowBlobs(ctx, w, h, ["rgba(50,120,255,0.1)", "rgba(0,200,150,0.08)"], 3, (data.glowIntensity ?? 0.5) * 0.4);
  drawNoiseOverlay(ctx, w, h, 0.008);

  drawLogo(ctx, data.channelLogo, 50, 40, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 50);

  const headerPanelY = h * 0.1;
  drawGlassPanel(ctx, 40, headerPanelY, w - 80, h * 0.18, 14, {
    bgColor: "rgba(255,255,255,0.06)",
    opacity: 0.1,
    edgeGlow: true,
    glossyStreak: true,
  });
  drawGlassBadge(ctx, data.category, w / 2, headerPanelY + 30, "rgba(50,150,255,0.2)", "#ffffff", "rgba(50,150,255,0.4)", 24);

  ctx.font = `800 44px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline, w / 2, headerPanelY + 70, w - 160, 56, "center");

  const infoY = h * 0.33;
  const colW = (w - 100) / 2;

  drawGlassPanel(ctx, 40, infoY, colW, h * 0.35, 12, {
    bgColor: "rgba(255,255,255,0.04)",
    opacity: 0.07,
    edgeGlow: true,
  });

  drawGlassPanel(ctx, 60 + colW, infoY, colW, h * 0.35, 12, {
    bgColor: "rgba(255,255,255,0.04)",
    opacity: 0.07,
    edgeGlow: true,
  });

  if (data.bulletText) {
    drawBulletText(ctx, data, 60, infoY + 20, colW - 40, "rgba(255,255,255,0.75)", data.highlightColor || "#4fc3f7");
  }

  if (data.mainPhoto) {
    drawPhoto(ctx, data, 60 + colW + 10, infoY + 10, colW - 20, h * 0.35 - 20, 8);
  }

  if (data.quoteText) {
    const quotePanelY = h * 0.72;
    drawGlassPanel(ctx, 40, quotePanelY, w - 80, h * 0.16, 12, {
      bgColor: "rgba(255,255,255,0.04)",
      opacity: 0.06,
    });
    ctx.font = `600 26px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    wrapText(ctx, data.quoteText, w / 2, quotePanelY + 20, w - 160, 34, "center");
  }

  drawDateLine(ctx, data, 50, h - 70, "rgba(255,255,255,0.3)");
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#4fc3f7", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassNeonSocial(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#050008";
  ctx.fillRect(0, 0, w, h);
  if (data.bgPreset?.gradientStops) applyGlassBackground(ctx, data, w, h, ["#050008"]);
  drawGlowBlobs(ctx, w, h, [
    "rgba(255,0,100,0.15)", "rgba(0,200,255,0.12)", "rgba(180,0,255,0.1)", "rgba(255,200,0,0.08)"
  ], 5, (data.glowIntensity ?? 0.5) * 0.8);
  drawNoiseOverlay(ctx, w, h, 0.01);

  drawLogo(ctx, data.channelLogo, 50, 40, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 50);

  const chipY = h * 0.12;
  drawGlassBadge(ctx, data.category, w / 2, chipY, "rgba(255,0,100,0.3)", "#ffffff", "rgba(255,0,100,0.6)", 30);

  const panelX = 40, panelY = h * 0.2, panelW = w - 80, panelH = h * 0.4;
  drawGlassPanel(ctx, panelX, panelY, panelW, panelH, 18, {
    bgColor: "rgba(255,255,255,0.06)",
    opacity: 0.1,
    edgeGlow: true,
    glossyStreak: true,
  });

  ctx.font = `900 58px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(255,0,100,0.4)";
  ctx.shadowBlur = 20;
  wrapText(ctx, data.headline.toUpperCase(), panelX + 30, panelY + 30, panelW - 60, 72, "left");
  ctx.shadowBlur = 0;

  if (data.subheadline) {
    ctx.font = `500 28px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    wrapText(ctx, data.subheadline, panelX + 30, panelY + panelH - 80, panelW - 60, 36, "left");
  }

  if (data.mainPhoto) {
    drawPhoto(ctx, data, w * 0.08, h * 0.65, w * 0.84, h * 0.28, 12);
    drawGlassEdge(ctx, w * 0.08, h * 0.65, w * 0.84, h * 0.28, 12, "rgba(255,0,200,0.25)");
  }

  drawSparkles(ctx, 0, 0, w, h, 20, "rgba(255,200,255,0.6)");
  drawGlowRing(ctx, w * 0.88, h * 0.1, 25, "rgba(0,200,255,0.4)", 2);
  drawGlowRing(ctx, w * 0.1, h * 0.92, 18, "rgba(255,0,200,0.3)", 2);
  drawAccentBar(ctx, 0, h - 5, w, 5, "#ff0064", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassLuxuryGradient(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  applyGlassBackground(ctx, data, w, h, ["#1a1000", "#0a0800", "#1a0a00", "#0d0600"]);
  drawGlowBlobs(ctx, w, h, ["rgba(212,175,55,0.12)", "rgba(255,200,50,0.08)", "rgba(180,140,40,0.06)"], 4, (data.glowIntensity ?? 0.5) * 0.6);
  drawNoiseOverlay(ctx, w, h, 0.01);

  if (data.mainPhoto) {
    const frameX = w * 0.1, frameY = h * 0.08, frameW = w * 0.8, frameH = h * 0.5;
    drawPhoto(ctx, data, frameX + 4, frameY + 4, frameW - 8, frameH - 8, 10);

    ctx.strokeStyle = "rgba(212,175,55,0.5)";
    ctx.lineWidth = 3;
    roundedRect(ctx, frameX, frameY, frameW, frameH, 12);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,215,0,0.2)";
    ctx.lineWidth = 1;
    roundedRect(ctx, frameX - 5, frameY - 5, frameW + 10, frameH + 10, 14);
    ctx.stroke();

    drawGlassReflection(ctx, frameX, frameY, frameW, frameH * 0.3, 10);
  }

  drawLogo(ctx, data.channelLogo, 50, h * 0.62, 130, 50);
  drawViaText(ctx, data.viaText, w - 50, h * 0.63);

  const textPanelY = h * 0.62;
  drawGlassPanel(ctx, 40, textPanelY, w - 80, h * 0.28, 14, {
    bgColor: "rgba(212,175,55,0.05)",
    opacity: 0.08,
    edgeGlow: true,
    glossyStreak: true,
  });

  drawGlassBadge(ctx, data.category, w / 2, textPanelY + 30, "rgba(212,175,55,0.2)", "#ffd700", "rgba(212,175,55,0.4)", 24);

  ctx.font = `800 50px ${hlFont(data)}`;
  ctx.fillStyle = "#fff8e1";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  wrapText(ctx, data.headline.toUpperCase(), w / 2, textPanelY + 70, w - 160, 62, "center");

  drawAccentBar(ctx, 0, h - 5, w, 5, "#d4af37", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassFrostedQuote(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  applyGlassBackground(ctx, data, w, h, ["#1a1a2e", "#2a2040", "#1a1830", "#101020"]);
  drawGlowBlobs(ctx, w, h, ["rgba(200,150,255,0.1)", "rgba(150,200,255,0.08)", "rgba(255,180,200,0.06)"], 4, (data.glowIntensity ?? 0.5) * 0.5);
  drawNoiseOverlay(ctx, w, h, 0.01);

  const r = getGlassRadius(data, 22);
  const panelX = 40, panelY = h * 0.06, panelW = w - 80, panelH = h * 0.88;
  drawGlassPanel(ctx, panelX, panelY, panelW, panelH, r, {
    bgColor: "rgba(255,255,255,0.1)",
    opacity: getGlassOpacity(data, 0.18),
    edgeGlow: true,
    glossyStreak: true,
  });
  drawGlassReflection(ctx, panelX, panelY, panelW, panelH, 22);

  drawLogo(ctx, data.channelLogo, panelX + 20, panelY + 20, 120, 45);
  drawViaText(ctx, data.viaText, panelX + panelW - 20, panelY + 25);

  ctx.save();
  ctx.font = `300 240px Georgia, serif`;
  ctx.fillStyle = "rgba(200,150,255,0.08)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("\u201C", panelX + 20, panelY + 60);
  ctx.restore();

  const quoteText = data.quoteText || data.headline;
  ctx.font = `700 52px ${bnFont(data)}`;
  ctx.fillStyle = "#f0e8ff";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, quoteText, panelX + 60, panelY + 160, panelW - 120, 70, "left");

  drawAccentBar(ctx, panelX + 60, endY + 15, 80, 3, data.highlightColor || "#ce93d8", true);

  if (data.personName) {
    ctx.font = `700 30px ${bnFont(data)}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(data.personName, panelX + 60, endY + 35);
  }
  if (data.personTitle) {
    ctx.font = `400 22px ${SANS_FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(data.personTitle, panelX + 60, endY + 72);
  }

  if (data.mainPhoto) {
    const photoY = Math.max(endY + 100, h * 0.65);
    const photoH = panelY + panelH - photoY - 20;
    if (photoH > 60) {
      drawPhoto(ctx, data, panelX + 20, photoY, panelW - 40, photoH, 10);
      drawGlassEdge(ctx, panelX + 20, photoY, panelW - 40, photoH, 10, "rgba(200,150,255,0.2)");
    }
  }

  drawSparkles(ctx, panelX, panelY, panelW, 120, 8, "rgba(200,180,255,0.5)");
  drawAccentBar(ctx, 0, h - 5, w, 5, data.highlightColor || "#ce93d8", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

function renderGlassAiPoster(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  applyGlassBackground(ctx, data, w, h, ["#050510", "#0a0a2e", "#100520", "#050018"]);
  drawGlowBlobs(ctx, w, h, [
    "rgba(0,200,255,0.12)", "rgba(255,0,180,0.1)", "rgba(100,255,100,0.06)", "rgba(255,200,0,0.08)"
  ], 6, (data.glowIntensity ?? 0.5) * 0.7);
  drawNoiseOverlay(ctx, w, h, 0.01);
  drawFloatingOrbs(ctx, w, h, [
    "rgba(0,200,255,0.15)", "rgba(255,0,200,0.12)", "rgba(100,255,150,0.1)", "rgba(255,200,50,0.12)"
  ], 8);

  drawLogo(ctx, data.channelLogo, 50, 40, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 50);

  const mainPanelX = 50, mainPanelY = h * 0.14, mainPanelW = w - 100, mainPanelH = h * 0.5;
  drawGlassPanel(ctx, mainPanelX, mainPanelY, mainPanelW, mainPanelH, 20, {
    bgColor: "rgba(255,255,255,0.06)",
    opacity: 0.1,
    edgeGlow: true,
    glossyStreak: true,
  });
  drawGlassReflection(ctx, mainPanelX, mainPanelY, mainPanelW, mainPanelH, 20);

  drawGlassBadge(ctx, data.category, w / 2, mainPanelY + 40, "rgba(0,200,255,0.2)", "#00e5ff", "rgba(0,200,255,0.5)", 26);

  ctx.font = `900 56px ${hlFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,200,255,0.3)";
  ctx.shadowBlur = 12;
  const endY = wrapText(ctx, data.headline.toUpperCase(), w / 2, mainPanelY + 90, mainPanelW - 60, 70, "center");
  ctx.shadowBlur = 0;

  if (data.subheadline) {
    ctx.font = `500 28px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    wrapText(ctx, data.subheadline, w / 2, endY + 5, mainPanelW - 80, 36, "center");
  }

  if (data.mainPhoto) {
    const photoY = h * 0.68;
    drawPhoto(ctx, data, w * 0.12, photoY, w * 0.76, h * 0.25, 12);
    drawGlassEdge(ctx, w * 0.12, photoY, w * 0.76, h * 0.25, 12, "rgba(0,200,255,0.2)");
  }

  drawSparkles(ctx, 0, 0, w, h, 25, "rgba(200,220,255,0.5)");
  drawGlowRing(ctx, w * 0.15, h * 0.1, 35, "rgba(0,200,255,0.2)", 2);
  drawGlowRing(ctx, w * 0.85, h * 0.9, 28, "rgba(255,0,200,0.2)", 2);
  drawGlowRing(ctx, w * 0.5, h * 0.95, 20, "rgba(100,255,100,0.15)", 1.5);

  drawAccentBar(ctx, 0, h - 5, w, 5, "#00e5ff", true);
  drawAutoDecorate(ctx, data, w, h);
  drawOtvWatermark(ctx, data);
}

// ─── NEW PREMIUM PHOTO TEMPLATES ──────────────────────────────────────────────

function renderPhotoBreakingTicker(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  // Full bleed photo background
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
  } else {
    drawDarkBg(ctx, w, h, "#0a0a0a", "#1a1a1a");
  }
  // Heavy bottom gradient for text readability
  const btmGrad = createGradient(ctx, 0, h * 0.35, 0, h, [
    [0, "transparent"],
    [0.4, "rgba(0,0,0,0.6)"],
    [1, "rgba(0,0,0,0.95)"],
  ]);
  ctx.fillStyle = btmGrad;
  ctx.fillRect(0, 0, w, h);
  // Top logo area
  const topGrad = createGradient(ctx, 0, 0, 0, h * 0.18, [
    [0, "rgba(0,0,0,0.7)"],
    [1, "transparent"],
  ]);
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, h);
  drawLogo(ctx, data.channelLogo, 40, 35, 160, 60);
  drawViaText(ctx, data.viaText, w - 40, 55);
  // Breaking ticker bar
  const tickerH = 68;
  const accent = data.highlightColor || "#ff1744";
  ctx.fillStyle = accent;
  ctx.fillRect(0, h - tickerH - 50, 220, tickerH);
  ctx.font = `900 24px 'Montserrat', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("BREAKING", 110, h - tickerH - 50 + tickerH / 2);
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(220, h - tickerH - 50, w - 220, tickerH);
  ctx.font = `700 30px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const tickerText = data.headline.length > 60 ? data.headline.substring(0, 60) + "..." : data.headline;
  ctx.fillText(tickerText, 240, h - tickerH - 50 + tickerH / 2);
  // Main headline above ticker
  ctx.font = `800 64px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  const lines = [];
  const words = data.headline.split(" ");
  let line = "";
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > w - 90 && line) {
      lines.push(line.trim()); line = word + " ";
    } else { line = test; }
  }
  if (line.trim()) lines.push(line.trim());
  const lastLines = lines.slice(-2);
  for (let i = lastLines.length - 1; i >= 0; i--) {
    ctx.fillText(lastLines[i], 45, h - tickerH - 60 - (lastLines.length - 1 - i) * 76);
  }
  drawAccentBar(ctx, 0, h - 50, w, 8, accent, true);
  drawOtvWatermark(ctx, data);
}

function renderPhotoLeftPanel(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const accent = data.highlightColor || "#ffc107";
  // Right half: photo
  if (data.mainPhoto) {
    drawPhoto(ctx, data, w * 0.45, 0, w * 0.55, h);
    // Gradient blend from text panel to photo
    const blend = createGradient(ctx, w * 0.42, 0, w * 0.58, 0, [
      [0, "#0f1220"],
      [0.5, "rgba(15,18,32,0.8)"],
      [1, "transparent"],
    ]);
    ctx.fillStyle = blend;
    ctx.fillRect(w * 0.42, 0, w * 0.2, h);
  }
  // Left panel background
  ctx.fillStyle = "#0f1220";
  ctx.fillRect(0, 0, w * 0.45, h);
  drawEditorialGrid(ctx, 0, 0, w * 0.45, h, 50, "rgba(100,120,255,0.035)", "none");
  drawNoiseOverlay(ctx, w * 0.45, h, 0.012);
  // Accent bar on left
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 6, h);
  drawLogo(ctx, data.channelLogo, 30, 40, 150, 55);
  // Badge
  ctx.font = `900 18px 'Montserrat', sans-serif`;
  ctx.fillStyle = accent;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(data.category, 30, 120);
  // Headline
  ctx.font = `800 58px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  const endY = wrapText(ctx, data.headline, 30, 160, w * 0.42, 74, "left");
  // Subheadline
  if (data.subheadline) {
    ctx.font = `400 28px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    wrapText(ctx, data.subheadline, 30, endY + 20, w * 0.42, 40, "left");
  }
  // Via text bottom
  ctx.font = `500 22px 'Montserrat', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(data.viaText, 30, h - 40);
  drawAccentBar(ctx, 0, h - 6, w, 6, accent, true);
  drawOtvWatermark(ctx, data);
}

function renderPhotoCinematicDark(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const accent = data.highlightColor || "#ffd700";
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
  } else {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, w, h);
  }
  // Cinematic letterbox bars
  ctx.fillStyle = "rgba(0,0,0,0.92)";
  ctx.fillRect(0, 0, w, h * 0.16);
  ctx.fillRect(0, h * 0.77, w, h * 0.23);
  // Middle dark overlay for text
  const midGrad = createGradient(ctx, 0, h * 0.5, 0, h * 0.77, [
    [0, "transparent"],
    [1, "rgba(0,0,0,0.5)"],
  ]);
  ctx.fillStyle = midGrad;
  ctx.fillRect(0, h * 0.5, w, h * 0.27);
  // Logo top bar
  drawLogo(ctx, data.channelLogo, 40, h * 0.03, 150, 55);
  ctx.font = `700 20px 'Montserrat', sans-serif`;
  ctx.fillStyle = accent;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(data.category, w - 40, h * 0.08);
  // Bottom bar content
  ctx.font = `800 62px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const bY = h * 0.855;
  wrapText(ctx, data.headline, w / 2, bY - 30, w - 100, 72, "center");
  // Accent line
  ctx.fillStyle = accent;
  ctx.fillRect(w / 2 - 60, h * 0.775, 120, 4);
  ctx.font = `500 22px 'Montserrat', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(data.viaText, w / 2, h - 15);
  drawOtvWatermark(ctx, data);
}

function renderPhotoMagazineCover(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const accent = data.highlightColor || "#e53935";
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
  } else {
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, w, h);
  }
  // Top masthead
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, w, 110);
  drawLogo(ctx, data.channelLogo, 25, 10, 180, 90);
  ctx.font = `900 42px 'Montserrat', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("NEWS", w - 30, 55);
  // Bottom white band
  const bandH = h * 0.32;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(0, h - bandH, w, bandH);
  // Category tag
  ctx.fillStyle = accent;
  ctx.fillRect(30, h - bandH + 20, 120, 34);
  ctx.font = `800 18px 'Montserrat', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(data.category, 90, h - bandH + 37);
  // Headline in white band
  ctx.font = `800 52px ${bnFont(data)}`;
  ctx.fillStyle = "#111111";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline, 30, h - bandH + 68, w - 60, 64, "left");
  ctx.font = `400 22px 'Montserrat', sans-serif`;
  ctx.fillStyle = "#666";
  ctx.textBaseline = "bottom";
  ctx.fillText(data.viaText + "  |  otv.online", 30, h - 20);
  drawOtvWatermark(ctx, data);
}

function renderPhotoNewsCard(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const accent = data.highlightColor || "#1565C0";
  // White card background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  // Top photo section
  const photoH = h * 0.54;
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, photoH);
  } else {
    ctx.fillStyle = "#e0e8f0";
    ctx.fillRect(0, 0, w, photoH);
    ctx.font = `300 32px 'Montserrat', sans-serif`;
    ctx.fillStyle = "#bbb";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PHOTO", w / 2, photoH / 2);
  }
  // Logo overlay on photo
  drawLogo(ctx, data.channelLogo, 20, 20, 140, 50);
  // Category badge on photo
  ctx.fillStyle = accent;
  ctx.fillRect(0, photoH - 44, 180, 44);
  ctx.font = `800 22px 'Montserrat', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(data.category, 90, photoH - 22);
  // Text section
  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(0, photoH, w, h - photoH);
  // Accent stripe
  ctx.fillStyle = accent;
  ctx.fillRect(0, photoH, 5, h - photoH);
  // Headline
  ctx.font = `800 52px ${bnFont(data)}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline, 35, photoH + 30, w - 70, 66, "left");
  // Source line
  ctx.font = `500 22px 'Montserrat', sans-serif`;
  ctx.fillStyle = accent;
  ctx.textBaseline = "bottom";
  ctx.fillText(data.viaText + "  ·  otv.online", 35, h - 25);
  drawOtvWatermark(ctx, data);
}

function renderPhotoSplitGradient(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const accent = data.highlightColor || "#7c4dff";
  // Dark left side
  const bgGrad = createGradient(ctx, 0, 0, w, 0, [
    [0, "#0a0a18"],
    [0.55, "#0f0f22"],
    [1, "#1a1a30"],
  ]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);
  drawNoiseOverlay(ctx, w, h, 0.015);
  // Photo on right half (clipped)
  if (data.mainPhoto) {
    ctx.save();
    const clipX = w * 0.48;
    ctx.beginPath();
    ctx.moveTo(clipX, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(clipX - 60, h);
    ctx.closePath();
    ctx.clip();
    drawPhoto(ctx, data, clipX - 60, 0, w - clipX + 60, h);
    // Blend gradient over photo edge
    const photoBlend = createGradient(ctx, clipX - 60, 0, clipX + 80, 0, [
      [0, "#0f0f22"],
      [1, "transparent"],
    ]);
    ctx.fillStyle = photoBlend;
    ctx.fillRect(clipX - 60, 0, 140, h);
    ctx.restore();
  }
  // Accent vertical bar
  ctx.fillStyle = accent;
  ctx.fillRect(w * 0.48 - 3, 0, 3, h);
  drawLogo(ctx, data.channelLogo, 35, 35, 160, 60);
  // Category
  ctx.font = `900 18px 'Montserrat', sans-serif`;
  ctx.fillStyle = accent;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("▶  " + data.category, 35, 125);
  // Headline
  ctx.font = `800 58px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  const eY = wrapText(ctx, data.headline, 35, 165, w * 0.48, 74, "left");
  // Sub
  if (data.subheadline) {
    ctx.font = `400 26px ${bnFont(data)}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    wrapText(ctx, data.subheadline, 35, eY + 18, w * 0.46, 38, "left");
  }
  // Bottom info
  ctx.font = `500 20px 'Montserrat', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  ctx.fillText(data.viaText, 35, h - 35);
  drawAccentBar(ctx, 0, h - 6, w, 6, accent, true);
  drawOtvWatermark(ctx, data);
}

function renderPhotoTopBanner(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const accent = data.highlightColor || "#00897b";
  // Full width photo top section
  const photoH = h * 0.48;
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, photoH);
  } else {
    const phBg = createGradient(ctx, 0, 0, 0, photoH, [
      [0, "#1a2838"],
      [1, "#0a1628"],
    ]);
    ctx.fillStyle = phBg;
    ctx.fillRect(0, 0, w, photoH);
  }
  // Photo overlay gradient
  const phGrad = createGradient(ctx, 0, photoH * 0.4, 0, photoH, [
    [0, "transparent"],
    [1, "rgba(0,0,0,0.4)"],
  ]);
  ctx.fillStyle = phGrad;
  ctx.fillRect(0, 0, w, photoH);
  // Logo on photo
  drawLogo(ctx, data.channelLogo, 30, 25, 150, 55);
  // Category badge on photo
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(w - 180, 25, 155, 46, 8);
  ctx.fill();
  ctx.font = `800 20px 'Montserrat', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(data.category, w - 102, 48);
  // Bottom card section
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, photoH, w, h - photoH);
  // Top border accent
  ctx.fillStyle = accent;
  ctx.fillRect(0, photoH, w, 5);
  // Headline
  ctx.font = `800 54px ${bnFont(data)}`;
  ctx.fillStyle = "#111111";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const eY2 = wrapText(ctx, data.headline, 40, photoH + 35, w - 80, 68, "left");
  // Separator line
  ctx.strokeStyle = `${accent}40`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, eY2 + 20);
  ctx.lineTo(w - 40, eY2 + 20);
  ctx.stroke();
  // Sub
  if (data.subheadline) {
    ctx.font = `400 26px ${bnFont(data)}`;
    ctx.fillStyle = "#555555";
    wrapText(ctx, data.subheadline, 40, eY2 + 35, w - 80, 38, "left");
  }
  // Source
  ctx.font = `600 22px 'Montserrat', sans-serif`;
  ctx.fillStyle = accent;
  ctx.textBaseline = "bottom";
  ctx.textAlign = "right";
  ctx.fillText(data.viaText, w - 40, h - 25);
  drawOtvWatermark(ctx, data);
}

function renderPhotoVignetteText(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const accent = data.highlightColor || "#ffc107";
  if (data.mainPhoto) {
    drawPhoto(ctx, data, 0, 0, w, h);
  } else {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);
  }
  // Vignette overlay
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  // Top bar
  const tGrad = createGradient(ctx, 0, 0, 0, h * 0.2, [
    [0, "rgba(0,0,0,0.75)"],
    [1, "transparent"],
  ]);
  ctx.fillStyle = tGrad;
  ctx.fillRect(0, 0, w, h);
  drawLogo(ctx, data.channelLogo, 40, 35, 150, 55);
  drawViaText(ctx, data.viaText, w - 40, 58);
  // Center badge
  drawBadge(ctx, data.category, w / 2, h * 0.42, accent, "#000", undefined, 28);
  // Center headline
  ctx.font = `800 68px ${bnFont(data)}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 15;
  const lines2: string[] = [];
  const words2 = data.headline.split(" ");
  let line2 = "";
  for (const w2 of words2) {
    const test = line2 + w2 + " ";
    if (ctx.measureText(test).width > w - 120 && line2) {
      lines2.push(line2.trim()); line2 = w2 + " ";
    } else { line2 = test; }
  }
  if (line2.trim()) lines2.push(line2.trim());
  const startY = h * 0.5 - (lines2.length * 80) / 2;
  lines2.forEach((ln, i) => ctx.fillText(ln, w / 2, startY + i * 80));
  ctx.shadowBlur = 0;
  // Bottom accent line
  ctx.fillStyle = accent;
  ctx.fillRect(w / 2 - 80, h * 0.5 + (lines2.length * 80) / 2 + 18, 160, 4);
  drawOtvWatermark(ctx, data);
}

export const templates: TemplateConfig[] = [
  {
    id: "jamuna-dark",
    name: "Jamuna Dark",
    nameBn: "\u099C\u09AE\u09C1\u09A8\u09BE \u09A1\u09BE\u09B0\u09CD\u0995",
    previewColors: ["#0a0e1f", "#1a0e3f"],
    accentColor: "#ffc107",
    defaultCategory: "JUSTICE",
    render: renderJamunaDark,
  },
  {
    id: "national-dark",
    name: "National Dark",
    nameBn: "\u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u09A1\u09BE\u09B0\u09CD\u0995",
    previewColors: ["#0d1117", "#000"],
    accentColor: "#ffc107",
    defaultCategory: "NATIONAL",
    render: renderNationalDark,
  },
  {
    id: "quote-card",
    name: "Quote Card",
    nameBn: "\u0989\u09A6\u09CD\u09A7\u09C3\u09A4\u09BF \u0995\u09BE\u09B0\u09CD\u09A1",
    previewColors: ["#f5f0e8", "#f0ebe0"],
    accentColor: "#ffc107",
    defaultCategory: "OPINION",
    render: renderQuoteCard,
  },
  {
    id: "clean-news",
    name: "Clean News",
    nameBn: "\u0995\u09CD\u09B2\u09BF\u09A8 \u09A8\u09BF\u0989\u099C",
    previewColors: ["#f0f0f0", "#e0e0e0"],
    accentColor: "#ff6600",
    defaultCategory: "NATIONAL",
    render: renderCleanNews,
  },
  {
    id: "dual-quote",
    name: "Dual Quote",
    nameBn: "\u09A1\u09C1\u09AF\u09BC\u09BE\u09B2 \u0995\u09CB\u099F",
    previewColors: ["#ffffff", "#1a1a2e"],
    accentColor: "#333",
    defaultCategory: "OPINION",
    render: renderDualQuote,
  },
  {
    id: "world-report",
    name: "World Report",
    nameBn: "\u09AC\u09BF\u09B6\u09CD\u09AC \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F",
    previewColors: ["#1a0f00", "#0d0800"],
    accentColor: "#ffc107",
    defaultCategory: "WORLD",
    render: renderWorldReport,
  },
  {
    id: "breaking-red",
    name: "Breaking Red",
    nameBn: "\u09AC\u09CD\u09B0\u09C7\u0995\u09BF\u0982 \u09B0\u09C7\u09A1",
    previewColors: ["#1a0000", "#2d0a0a"],
    accentColor: "#cc0000",
    defaultCategory: "BREAKING",
    render: renderBreakingRed,
  },
  {
    id: "sports-green",
    name: "Sports Green",
    nameBn: "\u09B8\u09CD\u09AA\u09CB\u09B0\u09CD\u099F\u09B8 \u0997\u09CD\u09B0\u09BF\u09A8",
    previewColors: ["#001a0d", "#002d1a"],
    accentColor: "#00e676",
    defaultCategory: "SPORTS",
    render: renderSportsGreen,
  },
  {
    id: "opinion-blue",
    name: "Opinion Blue",
    nameBn: "\u0993\u09AA\u09BF\u09A8\u09BF\u09AF\u09BC\u09A8 \u09AC\u09CD\u09B2\u09C1",
    previewColors: ["#0a1628", "#050d1a"],
    accentColor: "#4a90d9",
    defaultCategory: "OPINION",
    render: renderOpinionBlue,
  },
  {
    id: "investigation",
    name: "Investigation",
    nameBn: "\u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8",
    previewColors: ["#0d0015", "#050008"],
    accentColor: "#9c27b0",
    defaultCategory: "INVESTIGATION",
    render: renderInvestigation,
  },
  {
    id: "social-modern",
    name: "Social Modern",
    nameBn: "\u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2 \u09AE\u09A1\u09BE\u09B0\u09CD\u09A8",
    previewColors: ["#1e003c", "#000028"],
    accentColor: "#a855f7",
    defaultCategory: "TRENDING",
    render: renderSocialModern,
  },
  {
    id: "classic-formal",
    name: "Classic Formal",
    nameBn: "\u0995\u09CD\u09B2\u09BE\u09B8\u09BF\u0995 \u09AB\u09B0\u09CD\u09AE\u09BE\u09B2",
    previewColors: ["#0a1628", "#060e1a"],
    accentColor: "#d4af37",
    defaultCategory: "NATIONAL",
    render: renderClassicFormal,
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    nameBn: "\u09AE\u09BF\u09A8\u09BF\u09AE\u09BE\u09B2 \u09B2\u09BE\u0987\u099F",
    previewColors: ["#ffffff", "#f0f0f0"],
    accentColor: "#ffc107",
    defaultCategory: "NATIONAL",
    render: renderMinimalLight,
  },
  {
    id: "dual-quote-split",
    name: "Dual Quote Split",
    nameBn: "\u09A1\u09C1\u09AF\u09BC\u09BE\u09B2 \u0989\u09A6\u09CD\u09A7\u09C3\u09A4\u09BF",
    previewColors: ["#6b1f1f", "#1a5c42"],
    accentColor: "#ffc107",
    defaultCategory: "OPINION",
    render: renderDualQuoteSplit,
  },
  {
    id: "grid-highlight",
    name: "Grid Highlight",
    nameBn: "\u0997\u09CD\u09B0\u09BF\u09A1 \u09B9\u09BE\u0987\u09B2\u09BE\u0987\u099F",
    previewColors: ["#e8e4dc", "#c8dcc8"],
    accentColor: "#ffc107",
    defaultCategory: "WORLD",
    render: renderGridHighlight,
  },
  {
    id: "quote-highlight",
    name: "Quote Highlight",
    nameBn: "\u0989\u09A6\u09CD\u09A7\u09C3\u09A4\u09BF \u09B9\u09BE\u0987\u09B2\u09BE\u0987\u099F",
    previewColors: ["#e8e2d8", "#d8d0c4"],
    accentColor: "#ffc107",
    defaultCategory: "OPINION",
    render: renderQuoteHighlight,
  },
  {
    id: "news-summary",
    name: "News Summary",
    nameBn: "\u09A8\u09BF\u0989\u099C \u09B8\u09BE\u09B0\u09BE\u0982\u09B6",
    previewColors: ["#c8dcc8", "#b0ccb0"],
    accentColor: "#ffc107",
    defaultCategory: "NATIONAL",
    render: renderNewsSummary,
  },
  {
    id: "crimson-dark",
    name: "Crimson Dark",
    nameBn: "\u0995\u09CD\u09B0\u09BF\u09AE\u09B8\u09A8 \u09A1\u09BE\u09B0\u09CD\u0995",
    previewColors: ["#1a0005", "#0a0002"],
    accentColor: "#ff4444",
    defaultCategory: "BREAKING",
    render: renderCrimsonDark,
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    nameBn: "\u09AE\u09BF\u09A1\u09A8\u09BE\u0987\u099F \u09AC\u09CD\u09B2\u09C1",
    previewColors: ["#000a1a", "#000510"],
    accentColor: "#4488ff",
    defaultCategory: "NATIONAL",
    render: renderMidnightBlue,
  },
  {
    id: "forest-dark",
    name: "Forest Dark",
    nameBn: "\u09AB\u09B0\u09C7\u09B8\u09CD\u099F \u09A1\u09BE\u09B0\u09CD\u0995",
    previewColors: ["#001a0a", "#000a05"],
    accentColor: "#4caf50",
    defaultCategory: "ENVIRONMENT",
    render: renderForestDark,
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    nameBn: "\u09B8\u09BE\u09A8\u09B8\u09C7\u099F \u0985\u09B0\u09C7\u099E\u09CD\u099C",
    previewColors: ["#1a0a00", "#0a0500"],
    accentColor: "#ff9800",
    defaultCategory: "ENTERTAINMENT",
    render: renderSunsetOrange,
  },
  {
    id: "purple-haze",
    name: "Purple Haze",
    nameBn: "\u09AA\u09BE\u09B0\u09CD\u09AA\u09B2 \u09B9\u09C7\u099C",
    previewColors: ["#0f001a", "#05000a"],
    accentColor: "#ba68c8",
    defaultCategory: "CULTURE",
    render: renderPurpleHaze,
  },
  {
    id: "neon-cyan",
    name: "Neon Cyan",
    nameBn: "\u09A8\u09BF\u09AF\u09BC\u09A8 \u09B8\u09BE\u09AF\u09BC\u09BE\u09A8",
    previewColors: ["#001a1a", "#000a0a"],
    accentColor: "#00e5ff",
    defaultCategory: "TECHNOLOGY",
    render: renderNeonCyan,
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    nameBn: "\u09B0\u09CB\u099C \u0997\u09CB\u09B2\u09CD\u09A1",
    previewColors: ["#1a0a0a", "#0a0505"],
    accentColor: "#e0a0a0",
    defaultCategory: "LIFESTYLE",
    render: renderRoseGold,
  },
  {
    id: "steel-gray",
    name: "Steel Gray",
    nameBn: "\u09B8\u09CD\u099F\u09BF\u09B2 \u0997\u09CD\u09B0\u09C7",
    previewColors: ["#121518", "#08090b"],
    accentColor: "#90a4ae",
    defaultCategory: "BUSINESS",
    render: renderSteelGray,
  },
  {
    id: "emerald-night",
    name: "Emerald Night",
    nameBn: "\u098F\u09AE\u09C7\u09B0\u09BE\u09B2\u09CD\u09A1 \u09A8\u09BE\u0987\u099F",
    previewColors: ["#001510", "#000a08"],
    accentColor: "#00e676",
    defaultCategory: "NATIONAL",
    render: renderEmeraldNight,
  },
  {
    id: "coral-dark",
    name: "Coral Dark",
    nameBn: "\u0995\u09B0\u09BE\u09B2 \u09A1\u09BE\u09B0\u09CD\u0995",
    previewColors: ["#1a0808", "#0a0404"],
    accentColor: "#ff7043",
    defaultCategory: "TRENDING",
    render: renderCoralDark,
  },
  {
    id: "pastel-pink",
    name: "Pastel Pink",
    nameBn: "\u09AA\u09CD\u09AF\u09BE\u09B8\u09CD\u099F\u09C7\u09B2 \u09AA\u09BF\u0982\u0995",
    previewColors: ["#fff0f5", "#ffe8ef"],
    accentColor: "#e91e63",
    defaultCategory: "LIFESTYLE",
    render: renderPastelPink,
  },
  {
    id: "ivory-clean",
    name: "Ivory Clean",
    nameBn: "\u0986\u0987\u09AD\u09B0\u09BF \u0995\u09CD\u09B2\u09BF\u09A8",
    previewColors: ["#fffff0", "#f5f5dc"],
    accentColor: "#d4af37",
    defaultCategory: "NATIONAL",
    render: renderIvoryClean,
  },
  {
    id: "sage-green",
    name: "Sage Green",
    nameBn: "\u09B8\u09C7\u099C \u0997\u09CD\u09B0\u09BF\u09A8",
    previewColors: ["#f0f5f0", "#e0ebe0"],
    accentColor: "#4caf50",
    defaultCategory: "ENVIRONMENT",
    render: renderSageGreen,
  },
  {
    id: "sky-blue",
    name: "Sky Blue",
    nameBn: "\u09B8\u09CD\u0995\u09BE\u0987 \u09AC\u09CD\u09B2\u09C1",
    previewColors: ["#f0f5ff", "#e0eaff"],
    accentColor: "#2196f3",
    defaultCategory: "WEATHER",
    render: renderSkyBlue,
  },
  {
    id: "lavender-light",
    name: "Lavender Light",
    nameBn: "\u09B2\u09CD\u09AF\u09BE\u09AD\u09C7\u09A8\u09CD\u09A1\u09BE\u09B0 \u09B2\u09BE\u0987\u099F",
    previewColors: ["#f5f0ff", "#ece0ff"],
    accentColor: "#7c4dff",
    defaultCategory: "CULTURE",
    render: renderLavenderLight,
  },
  {
    id: "peach-warm",
    name: "Peach Warm",
    nameBn: "\u09AA\u09BF\u099A \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09AE",
    previewColors: ["#fff5f0", "#ffe8e0"],
    accentColor: "#ff7043",
    defaultCategory: "LIFESTYLE",
    render: renderPeachWarm,
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    nameBn: "\u09AE\u09BF\u09A8\u09CD\u099F \u09AB\u09CD\u09B0\u09C7\u09B6",
    previewColors: ["#f0fff5", "#e0ffe8"],
    accentColor: "#26a69a",
    defaultCategory: "HEALTH",
    render: renderMintFresh,
  },
  {
    id: "cream-classic",
    name: "Cream Classic",
    nameBn: "\u0995\u09CD\u09B0\u09BF\u09AE \u0995\u09CD\u09B2\u09BE\u09B8\u09BF\u0995",
    previewColors: ["#faf5e8", "#f0e8d0"],
    accentColor: "#8d6e63",
    defaultCategory: "OPINION",
    render: renderCreamClassic,
  },
  {
    id: "sand-warm",
    name: "Sand Warm",
    nameBn: "\u09B8\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1 \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09AE",
    previewColors: ["#f5f0e0", "#e8e0cc"],
    accentColor: "#bf8f00",
    defaultCategory: "NATIONAL",
    render: renderSandWarm,
  },
  {
    id: "snow-white",
    name: "Snow White",
    nameBn: "\u09B8\u09CD\u09A8\u09CB \u09B9\u09CB\u09AF\u09BC\u09BE\u0987\u099F",
    previewColors: ["#ffffff", "#f5f5f5"],
    accentColor: "#607d8b",
    defaultCategory: "NATIONAL",
    render: renderSnowWhite,
  },
  {
    id: "photo-full-overlay",
    name: "Photo Full Overlay",
    nameBn: "\u09AB\u099F\u09CB \u09AB\u09C1\u09B2 \u0993\u09AD\u09BE\u09B0\u09B2\u09C7",
    previewColors: ["#333", "#111"],
    accentColor: "#ffc107",
    defaultCategory: "NATIONAL",
    render: renderPhotoFullOverlay,
  },
  {
    id: "photo-blur-bg",
    name: "Photo Blur BG",
    nameBn: "\u09AB\u099F\u09CB \u09AC\u09CD\u09B2\u09BE\u09B0",
    previewColors: ["#200040", "#100020"],
    accentColor: "#e040fb",
    defaultCategory: "ENTERTAINMENT",
    render: renderPhotoBlurBg,
  },
  {
    id: "photo-cinematic",
    name: "Photo Cinematic",
    nameBn: "\u09AB\u099F\u09CB \u09B8\u09BF\u09A8\u09C7\u09AE\u09CD\u09AF\u09BE\u099F\u09BF\u0995",
    previewColors: ["#222", "#0a0a0a"],
    accentColor: "#ff9800",
    defaultCategory: "ENTERTAINMENT",
    render: renderPhotoCinematic,
  },
  {
    id: "photo-magazine",
    name: "Photo Magazine",
    nameBn: "\u09AB\u099F\u09CB \u09AE\u09CD\u09AF\u09BE\u0997\u09BE\u099C\u09BF\u09A8",
    previewColors: ["#1a1a1a", "#0a0a0a"],
    accentColor: "#ffffff",
    defaultCategory: "FEATURE",
    render: renderPhotoMagazine,
  },
  {
    id: "photo-editorial",
    name: "Photo Editorial",
    nameBn: "\u09AB\u099F\u09CB \u098F\u09A1\u09BF\u099F\u09CB\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2",
    previewColors: ["#000032", "#000018"],
    accentColor: "#4fc3f7",
    defaultCategory: "OPINION",
    render: renderPhotoEditorial,
  },
  {
    id: "photo-portrait",
    name: "Photo Portrait",
    nameBn: "\u09AB\u099F\u09CB \u09AA\u09CB\u09B0\u09CD\u099F\u09CD\u09B0\u09C7\u099F",
    previewColors: ["#0a0a14", "#050508"],
    accentColor: "#ffc107",
    defaultCategory: "PROFILE",
    render: renderPhotoPortrait,
  },
  {
    id: "photo-panorama",
    name: "Photo Panorama",
    nameBn: "\u09AB\u099F\u09CB \u09AA\u09CD\u09AF\u09BE\u09A8\u09CB\u09B0\u09BE\u09AE\u09BE",
    previewColors: ["#0d1117", "#050810"],
    accentColor: "#ffc107",
    defaultCategory: "NATIONAL",
    render: renderPhotoPanorama,
  },
  {
    id: "photo-vignette",
    name: "Photo Vignette",
    nameBn: "\u09AB\u099F\u09CB \u09AD\u09BF\u09A8\u09CD\u09AF\u09C7\u099F",
    previewColors: ["#222", "#000"],
    accentColor: "#ffc107",
    defaultCategory: "FEATURE",
    render: renderPhotoVignette,
  },
  {
    id: "photo-duotone",
    name: "Photo Duotone",
    nameBn: "\u09AB\u099F\u09CB \u09A1\u09C1\u09AF\u09BC\u09CB\u099F\u09CB\u09A8",
    previewColors: ["#1a237e", "#0d1240"],
    accentColor: "#7c4dff",
    defaultCategory: "FEATURE",
    render: renderPhotoDuotone,
  },
  {
    id: "photo-vintage",
    name: "Photo Vintage",
    nameBn: "\u09AB\u099F\u09CB \u09AD\u09BF\u09A8\u09CD\u099F\u09C7\u099C",
    previewColors: ["#3d2b10", "#1a1005"],
    accentColor: "#d4af37",
    defaultCategory: "FEATURE",
    render: renderPhotoVintage,
  },
  {
    id: "ramadan-green",
    name: "Ramadan Green",
    nameBn: "\u09B0\u09AE\u099C\u09BE\u09A8 \u0997\u09CD\u09B0\u09BF\u09A8",
    previewColors: ["#001a0d", "#000a05"],
    accentColor: "#2e7d32",
    defaultCategory: "RELIGION",
    render: renderRamadanGreen,
  },
  {
    id: "eid-gold",
    name: "Eid Gold",
    nameBn: "\u0988\u09A6 \u0997\u09CB\u09B2\u09CD\u09A1",
    previewColors: ["#1a1400", "#0a0a00"],
    accentColor: "#ffd700",
    defaultCategory: "RELIGION",
    render: renderEidGold,
  },
  {
    id: "victory-red",
    name: "Victory Red",
    nameBn: "\u09AD\u09BF\u0995\u09CD\u099F\u09B0\u09BF \u09B0\u09C7\u09A1",
    previewColors: ["#1a0000", "#0a0000"],
    accentColor: "#d32f2f",
    defaultCategory: "NATIONAL",
    render: renderVictoryRed,
  },
  {
    id: "independence-green",
    name: "Independence Green",
    nameBn: "\u09B8\u09CD\u09AC\u09BE\u09A7\u09C0\u09A8\u09A4\u09BE \u0997\u09CD\u09B0\u09BF\u09A8",
    previewColors: ["#002d0a", "#001505"],
    accentColor: "#1b5e20",
    defaultCategory: "NATIONAL",
    render: renderIndependenceGreen,
  },
  {
    id: "election-blue",
    name: "Election Blue",
    nameBn: "\u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u09AC\u09CD\u09B2\u09C1",
    previewColors: ["#000a1a", "#000510"],
    accentColor: "#1565c0",
    defaultCategory: "POLITICS",
    render: renderElectionBlue,
  },
  {
    id: "weather-cyan",
    name: "Weather Cyan",
    nameBn: "\u0986\u09AC\u09B9\u09BE\u0993\u09AF\u09BC\u09BE \u09B8\u09BE\u09AF\u09BC\u09BE\u09A8",
    previewColors: ["#001520", "#000a10"],
    accentColor: "#00acc1",
    defaultCategory: "WEATHER",
    render: renderWeatherCyan,
  },
  {
    id: "health-green",
    name: "Health Green",
    nameBn: "\u09B9\u09C7\u09B2\u09A5 \u0997\u09CD\u09B0\u09BF\u09A8",
    previewColors: ["#001510", "#000a08"],
    accentColor: "#43a047",
    defaultCategory: "HEALTH",
    render: renderHealthGreen,
  },
  {
    id: "tech-blue",
    name: "Tech Blue",
    nameBn: "\u099F\u09C7\u0995 \u09AC\u09CD\u09B2\u09C1",
    previewColors: ["#000818", "#00040c"],
    accentColor: "#1e88e5",
    defaultCategory: "TECHNOLOGY",
    render: renderTechBlue,
  },
  {
    id: "economy-gold",
    name: "Economy Gold",
    nameBn: "\u0987\u0995\u09A8\u09AE\u09BF \u0997\u09CB\u09B2\u09CD\u09A1",
    previewColors: ["#1a1200", "#0a0900"],
    accentColor: "#f9a825",
    defaultCategory: "ECONOMY",
    render: renderEconomyGold,
  },
  {
    id: "education-purple",
    name: "Education Purple",
    nameBn: "\u098F\u09A1\u09C1\u0995\u09C7\u09B6\u09A8 \u09AA\u09BE\u09B0\u09CD\u09AA\u09B2",
    previewColors: ["#0a0018", "#05000c"],
    accentColor: "#7b1fa2",
    defaultCategory: "EDUCATION",
    render: renderEducationPurple,
  },
  {
    id: "glass-card",
    name: "Glass Card",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u0995\u09BE\u09B0\u09CD\u09A1",
    previewColors: ["#1a2838", "#0a1420"],
    accentColor: "#ffc107",
    defaultCategory: "FEATURE",
    render: renderGlassCard,
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    nameBn: "\u09A8\u09BF\u09AF\u09BC\u09A8 \u0997\u09CD\u09B2\u09CB",
    previewColors: ["#000", "#001a10"],
    accentColor: "#00ffc8",
    defaultCategory: "TRENDING",
    render: renderNeonGlow,
  },
  {
    id: "gradient-mesh",
    name: "Gradient Mesh",
    nameBn: "\u0997\u09CD\u09B0\u09C7\u09A1\u09BF\u09AF\u09BC\u09C7\u09A8\u09CD\u099F \u09AE\u09C7\u09B6",
    previewColors: ["#0a0a2e", "#050514"],
    accentColor: "#ff6ec7",
    defaultCategory: "FEATURE",
    render: renderGradientMesh,
  },
  {
    id: "paper-texture",
    name: "Paper Texture",
    nameBn: "\u09AA\u09C7\u09AA\u09BE\u09B0 \u099F\u09C7\u0995\u09CD\u09B8\u099A\u09BE\u09B0",
    previewColors: ["#f0e8d8", "#e0d8c8"],
    accentColor: "#8d6e63",
    defaultCategory: "OPINION",
    render: renderPaperTexture,
  },
  {
    id: "film-grain",
    name: "Film Grain",
    nameBn: "\u09AB\u09BF\u09B2\u09CD\u09AE \u0997\u09CD\u09B0\u09C7\u09A8",
    previewColors: ["#222", "#0a0a0a"],
    accentColor: "#e0e0e0",
    defaultCategory: "FEATURE",
    render: renderFilmGrain,
  },
  {
    id: "retro-wave",
    name: "Retro Wave",
    nameBn: "\u09B0\u09C7\u099F\u09CD\u09B0\u09CB \u0993\u09AF\u09BC\u09C7\u09AD",
    previewColors: ["#0f0030", "#1a0050"],
    accentColor: "#ff6ec7",
    defaultCategory: "ENTERTAINMENT",
    render: renderRetroWave,
  },
  {
    id: "luxury-black",
    name: "Luxury Black",
    nameBn: "\u09B2\u09BE\u0995\u09CD\u09B8\u09BE\u09B0\u09BF \u09AC\u09CD\u09B2\u09CD\u09AF\u09BE\u0995",
    previewColors: ["#0a0a0a", "#000000"],
    accentColor: "#d4af37",
    defaultCategory: "FEATURE",
    render: renderLuxuryBlack,
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    nameBn: "\u09B0\u09AF\u09BC\u09C7\u09B2 \u09AA\u09BE\u09B0\u09CD\u09AA\u09B2",
    previewColors: ["#0f0020", "#050010"],
    accentColor: "#9c27b0",
    defaultCategory: "CULTURE",
    render: renderRoyalPurple,
  },
  {
    id: "fire-red",
    name: "Fire Red",
    nameBn: "\u09AB\u09BE\u09AF\u09BC\u09BE\u09B0 \u09B0\u09C7\u09A1",
    previewColors: ["#1a0000", "#0a0000"],
    accentColor: "#ff1744",
    defaultCategory: "BREAKING",
    render: renderFireRed,
  },
  {
    id: "ocean-deep",
    name: "Ocean Deep",
    nameBn: "\u0993\u09B6\u09BE\u09A8 \u09A1\u09BF\u09AA",
    previewColors: ["#001030", "#000818"],
    accentColor: "#0288d1",
    defaultCategory: "WORLD",
    render: renderOceanDeep,
  },
  {
    id: "glass-headline",
    name: "Glass Headline",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u09B9\u09C7\u09A1\u09B2\u09BE\u0987\u09A8",
    previewColors: ["#0a0a2e", "#1a0040"],
    accentColor: "#7c4dff",
    defaultCategory: "FEATURE",
    render: renderGlassHeadline,
  },
  {
    id: "glass-photo-overlay",
    name: "Glass Photo Overlay",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u09AB\u099F\u09CB \u0993\u09AD\u09BE\u09B0\u09B2\u09C7",
    previewColors: ["#1a2040", "#0a1020"],
    accentColor: "#00b0ff",
    defaultCategory: "NATIONAL",
    render: renderGlassPhotoOverlay,
  },
  {
    id: "glass-quote",
    name: "Glass Quote",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u0989\u09A6\u09CD\u09A7\u09C3\u09A4\u09BF",
    previewColors: ["#0a1a2e", "#001030"],
    accentColor: "#4fc3f7",
    defaultCategory: "OPINION",
    render: renderGlassQuote,
  },
  {
    id: "glass-breaking",
    name: "Glass Breaking",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u09AC\u09CD\u09B0\u09C7\u0995\u09BF\u0982",
    previewColors: ["#1a0000", "#2a0500"],
    accentColor: "#ff1744",
    defaultCategory: "BREAKING",
    render: renderGlassBreaking,
  },
  {
    id: "glass-portrait",
    name: "Glass Portrait",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u09AA\u09CB\u09B0\u09CD\u099F\u09CD\u09B0\u09C7\u099F",
    previewColors: ["#0a0020", "#1a0040"],
    accentColor: "#b388ff",
    defaultCategory: "PROFILE",
    render: renderGlassPortrait,
  },
  {
    id: "glass-editorial",
    name: "Glass Editorial",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u098F\u09A1\u09BF\u099F\u09CB\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2",
    previewColors: ["#0a0a18", "#101028"],
    accentColor: "#82b1ff",
    defaultCategory: "OPINION",
    render: renderGlassEditorial,
  },
  {
    id: "glass-glow-poster",
    name: "Glass Glow Poster",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u0997\u09CD\u09B2\u09CB \u09AA\u09CB\u09B8\u09CD\u099F\u09BE\u09B0",
    previewColors: ["#000000", "#001a10"],
    accentColor: "#00ffc8",
    defaultCategory: "TRENDING",
    render: renderGlassGlowPoster,
  },
  {
    id: "glass-info",
    name: "Glass Info",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u0987\u09A8\u09AB\u09CB",
    previewColors: ["#0a1020", "#081828"],
    accentColor: "#4fc3f7",
    defaultCategory: "NATIONAL",
    render: renderGlassInfo,
  },
  {
    id: "glass-neon-social",
    name: "Glass Neon Social",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u09A8\u09BF\u09AF\u09BC\u09A8 \u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2",
    previewColors: ["#050008", "#200020"],
    accentColor: "#ff0064",
    defaultCategory: "TRENDING",
    render: renderGlassNeonSocial,
  },
  {
    id: "glass-luxury-gradient",
    name: "Glass Luxury Gradient",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u09B2\u09BE\u0995\u09CD\u09B8\u09BE\u09B0\u09BF",
    previewColors: ["#1a1000", "#0d0600"],
    accentColor: "#d4af37",
    defaultCategory: "FEATURE",
    render: renderGlassLuxuryGradient,
  },
  {
    id: "glass-frosted-quote",
    name: "Glass Frosted Quote",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u09AB\u09CD\u09B0\u09B8\u09CD\u099F\u09C7\u09A1 \u0989\u09A6\u09CD\u09A7\u09C3\u09A4\u09BF",
    previewColors: ["#1a1a2e", "#2a2040"],
    accentColor: "#ce93d8",
    defaultCategory: "OPINION",
    render: renderGlassFrostedQuote,
  },
  {
    id: "glass-ai-poster",
    name: "Glass AI Poster",
    nameBn: "\u0997\u09CD\u09B2\u09BE\u09B8 \u098F\u0986\u0987 \u09AA\u09CB\u09B8\u09CD\u099F\u09BE\u09B0",
    previewColors: ["#050510", "#0a0a2e"],
    accentColor: "#00e5ff",
    defaultCategory: "TECHNOLOGY",
    render: renderGlassAiPoster,
  },
  // ─── NEW PREMIUM PHOTO TEMPLATES ───────────────────────────
  {
    id: "photo-breaking-ticker",
    name: "Breaking Ticker",
    nameBn: "\u09AC\u09CD\u09B0\u09C7\u0995\u09BF\u0982 \u099F\u09BF\u0995\u09BE\u09B0",
    previewColors: ["#111111", "#222222"],
    accentColor: "#ff1744",
    defaultCategory: "BREAKING",
    render: renderPhotoBreakingTicker,
  },
  {
    id: "photo-left-panel",
    name: "Left Panel",
    nameBn: "\u09AB\u099F\u09CB \u09AA\u09CD\u09AF\u09BE\u09A8\u09C5\u09B2",
    previewColors: ["#0f1220", "#1a1a30"],
    accentColor: "#ffc107",
    defaultCategory: "NATIONAL",
    render: renderPhotoLeftPanel,
  },
  {
    id: "photo-cinematic-dark",
    name: "Cinematic Dark",
    nameBn: "\u09B8\u09BF\u09A8\u09C7\u09AE\u09BE\u099F\u09BF\u0995 \u09A1\u09BE\u09B0\u09CD\u0995",
    previewColors: ["#111111", "#0a0a0a"],
    accentColor: "#ffd700",
    defaultCategory: "FEATURE",
    render: renderPhotoCinematicDark,
  },
  {
    id: "photo-magazine-cover",
    name: "Magazine Cover",
    nameBn: "\u09AE\u09CD\u09AF\u09BE\u0997\u09BE\u099C\u09BF\u09A8 \u0995\u09AD\u09BE\u09B0",
    previewColors: ["#e53935", "#ffffff"],
    accentColor: "#e53935",
    defaultCategory: "FEATURE",
    render: renderPhotoMagazineCover,
  },
  {
    id: "photo-news-card",
    name: "News Card",
    nameBn: "\u09AB\u099F\u09CB \u09A8\u09BF\u0989\u099C \u0995\u09BE\u09B0\u09CD\u09A1",
    previewColors: ["#ffffff", "#f8f9fa"],
    accentColor: "#1565C0",
    defaultCategory: "NATIONAL",
    render: renderPhotoNewsCard,
  },
  {
    id: "photo-split-gradient",
    name: "Split Gradient",
    nameBn: "\u09B8\u09CD\u09AA\u09CD\u09B2\u09BF\u099F \u0997\u09CD\u09B0\u09C7\u09A1\u09BF\u09AF\u09BC\u09C7\u09A8\u09CD\u099F",
    previewColors: ["#0a0a18", "#1a1a30"],
    accentColor: "#7c4dff",
    defaultCategory: "TRENDING",
    render: renderPhotoSplitGradient,
  },
  {
    id: "photo-top-banner",
    name: "Top Banner",
    nameBn: "\u099F\u09AA \u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0",
    previewColors: ["#ffffff", "#f0f4f8"],
    accentColor: "#00897b",
    defaultCategory: "NATIONAL",
    render: renderPhotoTopBanner,
  },
  {
    id: "photo-vignette-text",
    name: "Vignette Text",
    nameBn: "\u09AD\u09BF\u0997\u09A8\u09C7\u099F \u09B9\u09C7\u09A1\u09B2\u09BE\u0987\u09A8",
    previewColors: ["#111111", "#0a0a0a"],
    accentColor: "#ffc107",
    defaultCategory: "FEATURE",
    render: renderPhotoVignetteText,
  },
];
