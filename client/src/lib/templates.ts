import {
  wrapText,
  wrapTextLines,
  roundedRect,
  drawImageCover,
  createGradient,
  drawBadge,
  drawLogo,
  drawViaText,
  drawPhotoCredit,
  drawBottomTicker,
  drawGridLines,
  drawHighlightedText,
  drawCircularImage,
  HEADLINE_FONT,
  SANS_FONT,
  BENGALI_FONT,
} from "./canvas-utils";

export interface CardData {
  headline: string;
  headline2: string;
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
  otvLogoX: number;
  otvLogoY: number;
  otvLogoSize: number;
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
  align: "left" | "center" = "left"
): number {
  ctx.font = `900 ${fontSize}px ${HEADLINE_FONT}`;
  ctx.textBaseline = "top";
  const lines = wrapTextLines(ctx, text.toUpperCase(), maxWidth);
  let currentY = y;
  ctx.textAlign = align;

  for (let i = 0; i < lines.length; i++) {
    const words = lines[i].split(" ");
    if (align === "left") {
      let cx = x;
      for (let j = 0; j < words.length; j++) {
        const isHighlight = (i === lines.length - 2 && j >= Math.floor(words.length / 2)) ||
          (i === lines.length - 1 && j < Math.ceil(words.length / 2));
        ctx.fillStyle = isHighlight ? highlightColor : mainColor;
        ctx.textAlign = "left";
        ctx.fillText(words[j], cx, currentY);
        cx += ctx.measureText(words[j] + " ").width;
      }
    } else {
      ctx.fillStyle = i >= lines.length - 1 ? highlightColor : mainColor;
      ctx.fillText(lines[i], x, currentY);
    }
    currentY += lineHeight;
  }
  return currentY;
}

function renderJamunaDark(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a0e1f", "#000814");
  drawPurpleGlow(ctx, w, h);

  const gridGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  gridGrad.addColorStop(0, "rgba(100, 100, 150, 0.05)");
  gridGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gridGrad;
  for (let i = 0; i < w; i += 60) {
    ctx.fillRect(i, 0, 1, h * 0.5);
  }
  for (let i = 0; i < h * 0.5; i += 60) {
    ctx.fillRect(0, i, w, 1);
  }

  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.4, w, h * 0.6);
    const overlay = createGradient(ctx, 0, h * 0.35, 0, h * 0.65, [
      [0, "rgba(10, 14, 31, 1)"],
      [0.4, "rgba(10, 14, 31, 0.6)"],
      [1, "transparent"],
    ]);
    ctx.fillStyle = overlay;
    ctx.fillRect(0, h * 0.35, w, h * 0.3);
  }

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);

  drawBadge(ctx, data.category, w / 2, h * 0.17, "transparent", "#ffc107", "#ffc107", 32);

  drawHeadlineWithHighlight(
    ctx, data.headline, 60, h * 0.22, w - 120, 68, "#ffffff", "#ffc107", 82
  );

  drawPhotoCredit(ctx, "Photo \u2014 Collected", 28, h - 60);
  drawBottomTicker(ctx, w, h);
  drawOtvWatermark(ctx, data);
}

function renderQuoteCard(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, w, h);

  const textGrad = createGradient(ctx, 0, 0, 0, h * 0.55, [
    [0, "#faf7f0"],
    [1, "#f0ebe0"],
  ]);
  ctx.fillStyle = textGrad;
  ctx.fillRect(0, 0, w, h * 0.58);

  ctx.font = `700 52px ${BENGALI_FONT}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 60, 60, w - 120, 68, "left");

  ctx.fillStyle = "#ffc107";
  ctx.fillRect(60, endY + 10, 80, 4);

  ctx.font = `700 32px ${BENGALI_FONT}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "left";
  ctx.fillText(data.personName || data.category, 60, endY + 30);

  ctx.font = `400 22px ${BENGALI_FONT}`;
  ctx.fillStyle = "#555";
  ctx.fillText(data.personTitle || data.viaText, 60, endY + 70);

  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, w * 0.3, h * 0.5, w * 0.7, h * 0.5);
  }

  drawLogo(ctx, data.channelLogo, 50, h - 80, 140, 55);
  drawBottomTicker(ctx, w, h, "#ffc107");
  drawOtvWatermark(ctx, data);
}

function renderCleanNews(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(0, 0, w, h * 0.52);

  ctx.fillStyle = data.highlightColor || "#ff6600";
  ctx.fillRect(60, 60, 40, 40);

  if (data.channelLogo) {
    drawLogo(ctx, data.channelLogo, w - 120, 40, 70, 70);
  }

  ctx.font = `800 58px ${BENGALI_FONT}`;
  ctx.fillStyle = "#111111";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 60, 130, w - 120, 72, "left");

  ctx.font = `400 22px ${SANS_FONT}`;
  ctx.fillStyle = "#666";
  ctx.textAlign = "left";
  ctx.fillText(`Courtesy: ${data.viaText} | ${data.category}`, 60, endY + 10);

  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.52, w, h * 0.48);
  }
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

  ctx.font = `800 44px ${BENGALI_FONT}`;
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

  ctx.font = `800 44px ${BENGALI_FONT}`;
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

  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.42, w, h * 0.58);
    const overlay = createGradient(ctx, 0, h * 0.35, 0, h * 0.7, [
      [0, "rgba(13, 17, 23, 1)"],
      [0.5, "rgba(13, 17, 23, 0.7)"],
      [1, "rgba(0,0,0,0.3)"],
    ]);
    ctx.fillStyle = overlay;
    ctx.fillRect(0, h * 0.35, w, h * 0.35);
  }

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);

  drawBadge(ctx, data.category, w / 2, h * 0.16, "transparent", "#ffc107", "#ffc107", 30);

  drawHeadlineWithHighlight(
    ctx, data.headline, 60, h * 0.21, w - 120, 62, "#ffffff", "#ffc107", 78
  );

  ctx.save();
  ctx.font = `400 18px ${SANS_FONT}`;
  ctx.fillStyle = "#aaa";
  ctx.globalAlpha = 0.7;
  ctx.translate(w - 25, h - 60);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Image \u2014 Collected", 0, 0);
  ctx.restore();

  ctx.fillStyle = "#ffc107";
  ctx.fillRect(0, h - 5, w, 5);
  drawOtvWatermark(ctx, data);
}

function renderWorldReport(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const grad = createGradient(ctx, 0, 0, 0, h, [
    [0, "#1a0f00"],
    [0.3, "#2d1800"],
    [0.7, "#0d0800"],
    [1, "#000000"],
  ]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.5);
  glow.addColorStop(0, "rgba(255, 170, 0, 0.08)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, w * 0.15, h * 0.4, w * 0.7, h * 0.55, 12);
    const imgOverlay = createGradient(ctx, 0, h * 0.35, 0, h * 0.6, [
      [0, "rgba(26, 15, 0, 0.9)"],
      [0.5, "rgba(26, 15, 0, 0.3)"],
      [1, "transparent"],
    ]);
    ctx.fillStyle = imgOverlay;
    ctx.fillRect(w * 0.15, h * 0.4, w * 0.7, h * 0.2);
  }

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);

  drawBadge(ctx, data.category, w / 2, h * 0.16, "#ffc107", "#000", undefined, 32);

  drawHeadlineWithHighlight(
    ctx, data.headline, 60, h * 0.22, w - 120, 64, "#ffffff", "#ffc107", 80
  );

  ctx.fillStyle = "#ffc107";
  ctx.fillRect(0, h - 80, w, 70);
  ctx.font = `700 22px ${BENGALI_FONT}`;
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Sponsor Area", w / 2, h - 45);
  drawBottomTicker(ctx, w, h, "#000");
  drawOtvWatermark(ctx, data);
}

function renderBreakingRed(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const grad = createGradient(ctx, 0, 0, 0, h, [
    [0, "#1a0000"],
    [0.5, "#2d0a0a"],
    [1, "#0a0000"],
  ]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.2, w * 0.5);
  glow.addColorStop(0, "rgba(255, 0, 0, 0.12)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#cc0000";
  ctx.fillRect(0, 0, w, 8);

  drawLogo(ctx, data.channelLogo, 50, 30, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 40);

  drawBadge(ctx, "BREAKING", w / 2, h * 0.14, "#cc0000", "#ffffff", undefined, 38);

  ctx.font = `900 72px ${HEADLINE_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.2, w - 120, 88, "left");

  if (data.mainPhoto) {
    ctx.save();
    roundedRect(ctx, w * 0.1, h * 0.52, w * 0.8, h * 0.4, 12);
    ctx.clip();
    drawImageCover(ctx, data.mainPhoto, w * 0.1, h * 0.52, w * 0.8, h * 0.4);
    ctx.restore();

    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 4;
    roundedRect(ctx, w * 0.1, h * 0.52, w * 0.8, h * 0.4, 12);
    ctx.stroke();
  }

  drawBottomTicker(ctx, w, h, "#cc0000");
  drawOtvWatermark(ctx, data);
}

function renderSportsGreen(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  const grad = createGradient(ctx, 0, 0, 0, h, [
    [0, "#001a0d"],
    [0.5, "#002d1a"],
    [1, "#000a05"],
  ]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, h * 0.45);
  ctx.lineTo(w, h * 0.35);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.clip();
  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.3, w, h * 0.7);
  }
  ctx.restore();

  const overlay = createGradient(ctx, 0, h * 0.3, 0, h * 0.7, [
    [0, "rgba(0, 26, 13, 1)"],
    [0.3, "rgba(0, 26, 13, 0.5)"],
    [1, "rgba(0, 10, 5, 0.3)"],
  ]);
  ctx.fillStyle = overlay;
  ctx.fillRect(0, h * 0.3, w, h * 0.4);

  ctx.strokeStyle = "#00e676";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.45);
  ctx.lineTo(w, h * 0.35);
  ctx.stroke();

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);

  drawBadge(ctx, data.category || "SPORTS", w / 2, h * 0.12, "#00c853", "#ffffff", undefined, 30);

  drawHeadlineWithHighlight(
    ctx, data.headline, 60, h * 0.17, w - 120, 60, "#ffffff", "#00e676", 76
  );

  drawBottomTicker(ctx, w, h, "#00e676");
  drawOtvWatermark(ctx, data);
}

function renderOpinionBlue(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a1628", "#050d1a");

  const glow = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, w * 0.5);
  glow.addColorStop(0, "rgba(30, 90, 180, 0.1)");
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

  ctx.fillStyle = "#4a90d9";
  ctx.fillRect(60, h * 0.14, 60, 5);

  ctx.font = `600 48px ${BENGALI_FONT}`;
  ctx.fillStyle = "#e0e8f5";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 60, h * 0.18, w - 120, 64, "left");

  ctx.fillStyle = "#4a90d9";
  ctx.fillRect(60, endY + 10, 80, 4);

  if (data.personName) {
    ctx.font = `700 30px ${BENGALI_FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(data.personName, 60, endY + 30);
  }
  if (data.personTitle) {
    ctx.font = `400 22px ${BENGALI_FONT}`;
    ctx.fillStyle = "#8899bb";
    ctx.fillText(data.personTitle, 60, endY + 68);
  }

  if (data.mainPhoto) {
    ctx.save();
    ctx.beginPath();
    const cx = w * 0.7;
    const cy = h * 0.72;
    const rx = w * 0.25;
    ctx.arc(cx, cy, rx, 0, Math.PI * 2);
    ctx.clip();
    drawImageCover(ctx, data.mainPhoto, cx - rx, cy - rx, rx * 2, rx * 2);
    ctx.restore();

    ctx.strokeStyle = "#4a90d9";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.72, w * 0.25, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawBottomTicker(ctx, w, h, "#4a90d9");
  drawOtvWatermark(ctx, data);
}

function renderInvestigation(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0d0015", "#050008");

  const spotlight = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.4);
  spotlight.addColorStop(0, "rgba(150, 50, 200, 0.15)");
  spotlight.addColorStop(0.5, "rgba(100, 30, 150, 0.05)");
  spotlight.addColorStop(1, "transparent");
  ctx.fillStyle = spotlight;
  ctx.fillRect(0, 0, w, h);

  if (data.mainPhoto) {
    ctx.globalAlpha = 0.7;
    drawImageCover(ctx, data.mainPhoto, w * 0.2, h * 0.45, w * 0.6, h * 0.5, 8);
    ctx.globalAlpha = 1;

    const imgOverlay = createGradient(ctx, 0, h * 0.4, 0, h * 0.75, [
      [0, "rgba(13, 0, 21, 0.9)"],
      [0.5, "rgba(13, 0, 21, 0.4)"],
      [1, "rgba(5, 0, 8, 0.6)"],
    ]);
    ctx.fillStyle = imgOverlay;
    ctx.fillRect(w * 0.2, h * 0.45, w * 0.6, h * 0.5);
  }

  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);

  drawBadge(ctx, data.category || "INVESTIGATION", w / 2, h * 0.15, "#9c27b0", "#ffffff", undefined, 28);

  drawHeadlineWithHighlight(
    ctx, data.headline, 60, h * 0.2, w - 120, 62, "#e0c0ff", "#d580ff", 78
  );

  drawPhotoCredit(ctx, "Photo \u2014 Collected", 28, h - 60);
  drawBottomTicker(ctx, w, h, "#9c27b0");
  drawOtvWatermark(ctx, data);
}

function renderSocialModern(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, 0, w, h);
  } else {
    drawDarkBg(ctx, w, h, "#1a1a2e", "#000");
  }

  const overlay = createGradient(ctx, 0, 0, 0, h, [
    [0, "rgba(30, 0, 60, 0.85)"],
    [0.4, "rgba(10, 0, 40, 0.6)"],
    [0.7, "rgba(0, 0, 0, 0.7)"],
    [1, "rgba(0, 0, 0, 0.95)"],
  ]);
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, w, h);

  drawLogo(ctx, data.channelLogo, 50, 50, 140, 55);
  drawViaText(ctx, data.viaText, w - 50, 60);

  drawBadge(ctx, data.category, w / 2, h * 0.18, "rgba(255,255,255,0.15)", "#ffffff", "rgba(255,255,255,0.3)", 28);

  ctx.font = `900 70px ${HEADLINE_FONT}`;
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

  drawBottomTicker(ctx, w, h, "#a855f7");
  drawOtvWatermark(ctx, data);
}

function renderClassicFormal(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a1628", "#060e1a");

  ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
  ctx.lineWidth = 2;
  roundedRect(ctx, 30, 30, w - 60, h - 60, 0);
  ctx.stroke();

  ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
  ctx.lineWidth = 1;
  roundedRect(ctx, 40, 40, w - 80, h - 80, 0);
  ctx.stroke();

  drawLogo(ctx, data.channelLogo, 60, 55, 130, 50);
  drawViaText(ctx, data.viaText, w - 60, 60);

  ctx.fillStyle = "#d4af37";
  ctx.fillRect(w / 2 - 40, h * 0.12, 80, 3);

  drawBadge(ctx, data.category, w / 2, h * 0.16, "transparent", "#d4af37", "#d4af37", 28);

  ctx.font = `800 60px ${HEADLINE_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  const endY = wrapText(ctx, data.headline.toUpperCase(), w / 2, h * 0.22, w - 160, 76, "center");

  ctx.fillStyle = "#d4af37";
  ctx.fillRect(w / 2 - 40, endY + 5, 80, 3);

  if (data.mainPhoto) {
    const photoY = Math.max(endY + 25, h * 0.48);
    const photoH = h - photoY - 60;
    ctx.save();
    roundedRect(ctx, w * 0.12, photoY, w * 0.76, photoH, 4);
    ctx.clip();
    drawImageCover(ctx, data.mainPhoto, w * 0.12, photoY, w * 0.76, photoH);
    ctx.restore();

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    roundedRect(ctx, w * 0.12, photoY, w * 0.76, photoH, 4);
    ctx.stroke();
  }

  drawBottomTicker(ctx, w, h, "#d4af37");
  drawOtvWatermark(ctx, data);
}

function renderMinimalLight(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = data.highlightColor || "#ffc107";
  ctx.fillRect(0, 0, 8, h);

  drawLogo(ctx, data.channelLogo, 40, 40, 130, 50);

  ctx.font = `800 56px ${BENGALI_FONT}`;
  ctx.fillStyle = "#111";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 40, 120, w * 0.48, 70, "left");

  drawBadge(ctx, data.category, 40 + 60, endY + 30, data.highlightColor || "#ffc107", "#000", undefined, 24);

  ctx.font = `400 20px ${SANS_FONT}`;
  ctx.fillStyle = "#888";
  ctx.textAlign = "left";
  ctx.fillText(data.viaText, 40, endY + 80);

  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, w * 0.5, 0, w * 0.5, h, 0);
    const edgeGrad = createGradient(ctx, w * 0.5, 0, w * 0.55, 0, [
      [0, "#ffffff"],
      [1, "transparent"],
    ]);
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(w * 0.5, 0, w * 0.05, h);
  }
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

  ctx.font = `700 42px ${BENGALI_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  const leftText = data.headline || "";
  const rightText = data.headline2 || data.headline || "";
  const leftEndY = wrapText(ctx, leftText, 45, 100, halfW - 90, 56, "left");
  const rightEndY = wrapText(ctx, rightText, halfW + 45, 100, halfW - 90, 56, "left");

  ctx.fillStyle = data.highlightColor || "#ffc107";
  ctx.fillRect(45, leftEndY + 8, 70, 4);
  ctx.fillRect(halfW + 45, rightEndY + 8, 70, 4);

  ctx.font = `800 28px ${BENGALI_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  const ln1 = data.personName || "";
  const ln2 = data.personName2 || "";
  if (ln1) ctx.fillText(`\u2014 ${ln1}`, 45, leftEndY + 25);
  if (ln2) ctx.fillText(`\u2014 ${ln2}`, halfW + 45, rightEndY + 25);

  ctx.font = `400 20px ${BENGALI_FONT}`;
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
  ctx.fillStyle = "#e8e4dc";
  ctx.fillRect(0, 0, w, h);

  drawGridLines(ctx, 0, 0, w, h * 0.42, 35, "rgba(100,120,100,0.12)");

  ctx.fillStyle = "#1a5c42";
  ctx.fillRect(0, 0, 6, h * 0.42);
  ctx.fillRect(w - 6, 0, 6, h * 0.42);
  ctx.fillRect(0, 0, w, 6);
  ctx.fillRect(0, h * 0.42 - 6, w, 6);

  const endY = drawHighlightedText(
    ctx, data.headline, 50, 50, w - 100, 54, "#1a1a1a", "#ffc107", 72, BENGALI_FONT, "left", 16, 8
  );

  ctx.font = `500 22px ${BENGALI_FONT}`;
  ctx.fillStyle = "#555";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`\u09A4\u09A5\u09CD\u09AF\u09B8\u09C2\u09A4\u09CD\u09B0: ${data.viaText}`, 50, endY + 15);

  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.42, w, h * 0.58);
  }

  drawOtvWatermark(ctx, data);
}

function renderQuoteHighlight(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#e8e2d8";
  ctx.fillRect(0, 0, w, h);

  const topGrad = createGradient(ctx, 0, 0, 0, h * 0.1, [[0, "#d8d0c4"], [1, "#e8e2d8"]]);
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, h * 0.1);

  ctx.font = `700 140px ${SANS_FONT}`;
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("\u201C", 20, 10);

  const endY = drawHighlightedText(
    ctx, data.headline, 50, 100, w - 100, 58, "#1a1a1a", data.highlightColor || "#ffc107", 78, BENGALI_FONT, "left", 14, 8
  );

  ctx.font = `500 22px ${BENGALI_FONT}`;
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
    drawImageCover(ctx, data.mainPhoto, photoX, photoY, photoW, photoH);
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
    ctx, data.headline, 50, 30, w - 100, 50, "#1a1a1a", data.highlightColor || "#ffc107", 68, BENGALI_FONT, "left", 14, 8
  );

  ctx.font = `500 26px ${BENGALI_FONT}`;
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
      ctx, bullet, bulletX + 22, by + 2, bulletW - 30, 26, "#1a1a1a", data.highlightColor || "#ffc107", 34, BENGALI_FONT, "left", 8, 4
    );
    by = endY + 12;
  }
}

function makeGradientCard(
  c1: string, c2: string, accent: string, glowColor: string
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    drawDarkBg(ctx, w, h, c1, c2);
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.6);
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    if (data.mainPhoto) {
      drawImageCover(ctx, data.mainPhoto, 0, h * 0.45, w, h * 0.55);
      const overlay = createGradient(ctx, 0, h * 0.38, 0, h * 0.7, [
        [0, `${c1}`], [0.5, `${c1}99`], [1, "transparent"],
      ]);
      ctx.fillStyle = overlay;
      ctx.fillRect(0, h * 0.38, w, h * 0.32);
    }
    drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
    drawViaText(ctx, data.viaText, w - 50, 50);
    drawBadge(ctx, data.category, w / 2, h * 0.16, "transparent", accent, accent, 30);
    drawHeadlineWithHighlight(ctx, data.headline, 60, h * 0.21, w - 120, 62, "#ffffff", accent, 78);
    drawBottomTicker(ctx, w, h, accent);
    drawOtvWatermark(ctx, data);
  };
}

function makePhotoOverlayCard(
  overlayStops: [number, string][], accent: string, badgeBg: string, badgeText: string
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    if (data.mainPhoto) {
      drawImageCover(ctx, data.mainPhoto, 0, 0, w, h);
    } else {
      drawDarkBg(ctx, w, h, "#111", "#000");
    }
    const overlay = createGradient(ctx, 0, 0, 0, h, overlayStops);
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, w, h);
    drawLogo(ctx, data.channelLogo, 50, 50, 140, 55);
    drawViaText(ctx, data.viaText, w - 50, 60);
    drawBadge(ctx, data.category, w / 2, h * 0.15, badgeBg, badgeText, undefined, 28);
    ctx.font = `900 66px ${HEADLINE_FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.55, w - 120, 82, "left");
    drawBottomTicker(ctx, w, h, accent);
    drawOtvWatermark(ctx, data);
  };
}

function makeLightCard(
  bg1: string, bg2: string, accent: string, textColor: string
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    const grad = createGradient(ctx, 0, 0, 0, h, [[0, bg1], [1, bg2]]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    drawLogo(ctx, data.channelLogo, 50, 40, 130, 50);
    ctx.fillStyle = accent;
    ctx.fillRect(50, 110, 60, 5);
    ctx.font = `800 56px ${BENGALI_FONT}`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";
    const endY = wrapText(ctx, data.headline, 50, 130, w * 0.5, 70, "left");
    drawBadge(ctx, data.category, 50 + 60, endY + 20, accent, "#000", undefined, 22);
    ctx.font = `400 20px ${SANS_FONT}`;
    ctx.fillStyle = "#888";
    ctx.textAlign = "left";
    ctx.fillText(data.viaText, 50, endY + 70);
    if (data.mainPhoto) {
      drawImageCover(ctx, data.mainPhoto, w * 0.52, 0, w * 0.48, h);
      const edgeGrad = createGradient(ctx, w * 0.52, 0, w * 0.57, 0, [[0, bg1], [1, "transparent"]]);
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(w * 0.52, 0, w * 0.05, h);
    }
    drawOtvWatermark(ctx, data);
  };
}

function makeThemedCard(
  c1: string, c2: string, accent: string, glowColor: string, decorFn?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    drawDarkBg(ctx, w, h, c1, c2);
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.5);
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    if (decorFn) decorFn(ctx, w, h);
    drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
    drawViaText(ctx, data.viaText, w - 50, 50);
    drawBadge(ctx, data.category, w / 2, h * 0.14, accent, "#ffffff", undefined, 30);
    drawHeadlineWithHighlight(ctx, data.headline, 60, h * 0.19, w - 120, 60, "#ffffff", accent, 76);
    if (data.mainPhoto) {
      ctx.save();
      roundedRect(ctx, w * 0.1, h * 0.52, w * 0.8, h * 0.4, 10);
      ctx.clip();
      drawImageCover(ctx, data.mainPhoto, w * 0.1, h * 0.52, w * 0.8, h * 0.4);
      ctx.restore();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      roundedRect(ctx, w * 0.1, h * 0.52, w * 0.8, h * 0.4, 10);
      ctx.stroke();
    }
    drawBottomTicker(ctx, w, h, accent);
    drawOtvWatermark(ctx, data);
  };
}

function makePremiumCard(
  c1: string, c2: string, accent: string, borderAlpha: string, glowColor: string
): (ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) => void {
  return (ctx, data, w, h) => {
    drawDarkBg(ctx, w, h, c1, c2);
    const glow = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.3, h * 0.3, w * 0.5);
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = borderAlpha;
    ctx.lineWidth = 2;
    roundedRect(ctx, 25, 25, w - 50, h - 50, 0);
    ctx.stroke();
    drawLogo(ctx, data.channelLogo, 50, 50, 130, 50);
    drawViaText(ctx, data.viaText, w - 50, 55);
    ctx.fillStyle = accent;
    ctx.fillRect(w / 2 - 40, h * 0.13, 80, 3);
    drawBadge(ctx, data.category, w / 2, h * 0.17, "transparent", accent, accent, 28);
    ctx.font = `800 60px ${HEADLINE_FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    const endY = wrapText(ctx, data.headline.toUpperCase(), w / 2, h * 0.23, w - 140, 76, "center");
    ctx.fillStyle = accent;
    ctx.fillRect(w / 2 - 40, endY + 5, 80, 3);
    if (data.mainPhoto) {
      const photoY = Math.max(endY + 20, h * 0.5);
      const photoH = h - photoY - 50;
      ctx.save();
      roundedRect(ctx, w * 0.12, photoY, w * 0.76, photoH, 6);
      ctx.clip();
      drawImageCover(ctx, data.mainPhoto, w * 0.12, photoY, w * 0.76, photoH);
      ctx.restore();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      roundedRect(ctx, w * 0.12, photoY, w * 0.76, photoH, 6);
      ctx.stroke();
    }
    drawBottomTicker(ctx, w, h, accent);
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
  [[0, "rgba(20,0,40,0.85)"], [0.5, "rgba(10,0,30,0.6)"], [1, "rgba(0,0,0,0.95)"]],
  "#e040fb", "rgba(224,64,251,0.2)", "#ffffff"
);
const renderPhotoCinematic = makePhotoOverlayCard(
  [[0, "rgba(0,0,0,0.1)"], [0.4, "rgba(0,0,0,0)"], [0.6, "rgba(0,0,0,0.3)"], [1, "rgba(0,0,0,0.9)"]],
  "#ff9800", "#ff9800", "#000000"
);
const renderPhotoMagazine = makePhotoOverlayCard(
  [[0, "rgba(0,0,0,0.7)"], [0.3, "rgba(0,0,0,0.2)"], [0.7, "rgba(0,0,0,0.2)"], [1, "rgba(0,0,0,0.8)"]],
  "#ffffff", "#ffffff", "#000000"
);
const renderPhotoEditorial = makePhotoOverlayCard(
  [[0, "rgba(0,0,50,0.6)"], [0.5, "rgba(0,0,30,0.3)"], [1, "rgba(0,0,0,0.85)"]],
  "#4fc3f7", "rgba(79,195,247,0.2)", "#ffffff"
);

function renderPhotoPortrait(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  drawDarkBg(ctx, w, h, "#0a0a14", "#000");
  if (data.mainPhoto) {
    const photoW = w * 0.55;
    drawImageCover(ctx, data.mainPhoto, w - photoW, 0, photoW, h);
    const fade = createGradient(ctx, w - photoW, 0, w - photoW + photoW * 0.4, 0, [
      [0, "#0a0a14"], [1, "transparent"],
    ]);
    ctx.fillStyle = fade;
    ctx.fillRect(w - photoW, 0, photoW * 0.4, h);
  }
  drawLogo(ctx, data.channelLogo, 40, 40, 130, 50);
  ctx.fillStyle = "#ffc107";
  ctx.fillRect(40, 120, 60, 4);
  ctx.font = `800 52px ${BENGALI_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline, 40, 140, w * 0.45, 66, "left");
  if (data.personName) {
    ctx.font = `600 26px ${BENGALI_FONT}`;
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
  drawBottomTicker(ctx, w, h, "#ffc107");
  drawOtvWatermark(ctx, data);
}

function renderPhotoPanorama(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, 0, w, h * 0.6);
  }
  drawDarkBg(ctx, w, h * 0.45, "#0d1117", "#000000");
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  const fade = createGradient(ctx, 0, h * 0.5, 0, h * 0.6, [[0, "transparent"], [1, "#0d1117"]]);
  ctx.fillStyle = fade;
  ctx.fillRect(0, h * 0.5, w, h * 0.1);
  drawLogo(ctx, data.channelLogo, 50, h * 0.58, 130, 50);
  drawViaText(ctx, data.viaText, w - 50, h * 0.6);
  ctx.font = `900 60px ${HEADLINE_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 50, h * 0.66, w - 100, 74, "left");
  drawBottomTicker(ctx, w, h, "#ffc107");
  drawOtvWatermark(ctx, data);
}

function renderPhotoVignette(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, 0, w, h);
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
  ctx.font = `900 64px ${HEADLINE_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.7, w - 120, 80, "left");
  drawBottomTicker(ctx, w, h, "#ffc107");
  drawOtvWatermark(ctx, data);
}

function renderPhotoDuotone(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, 0, w, h);
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
  ctx.font = `900 66px ${HEADLINE_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.6, w - 120, 82, "left");
  drawBottomTicker(ctx, w, h, "#7c4dff");
  drawOtvWatermark(ctx, data);
}

function renderPhotoVintage(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, 0, w, h);
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
  ctx.font = `900 62px ${HEADLINE_FONT}`;
  ctx.fillStyle = "#f5e6c8";
  ctx.textBaseline = "top";
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.6, w - 120, 78, "left");
  drawBottomTicker(ctx, w, h, "#d4af37");
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
    drawImageCover(ctx, data.mainPhoto, 0, 0, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
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
  ctx.font = `800 58px ${HEADLINE_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  wrapText(ctx, data.headline.toUpperCase(), w / 2, panelY + panelH * 0.28, panelW - 60, 72, "center");
  drawBottomTicker(ctx, w, h, "#ffc107");
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
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.5, w, h * 0.5);
    const imgFade = createGradient(ctx, 0, h * 0.45, 0, h * 0.65, [[0, "#000"], [1, "transparent"]]);
    ctx.fillStyle = imgFade;
    ctx.fillRect(0, h * 0.45, w, h * 0.2);
  }
  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  ctx.font = `900 66px ${HEADLINE_FONT}`;
  ctx.fillStyle = "#00ffc8";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,255,200,0.6)";
  ctx.shadowBlur = 25;
  wrapText(ctx, data.headline.toUpperCase(), 60, h * 0.2, w - 120, 82, "left");
  ctx.shadowBlur = 0;
  drawBottomTicker(ctx, w, h, "#00ffc8");
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
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.48, w, h * 0.52);
    const imgFade = createGradient(ctx, 0, h * 0.42, 0, h * 0.6, [[0, "#0a0a2e"], [1, "transparent"]]);
    ctx.fillStyle = imgFade;
    ctx.fillRect(0, h * 0.42, w, h * 0.18);
  }
  drawLogo(ctx, data.channelLogo, 50, 40, 150, 60);
  drawViaText(ctx, data.viaText, w - 50, 50);
  drawBadge(ctx, data.category, w / 2, h * 0.15, "rgba(255,255,255,0.1)", "#ffffff", "rgba(255,255,255,0.2)", 28);
  drawHeadlineWithHighlight(ctx, data.headline, 60, h * 0.2, w - 120, 62, "#ffffff", "#ff6ec7", 78);
  drawBottomTicker(ctx, w, h, "#ff6ec7");
  drawOtvWatermark(ctx, data);
}

function renderPaperTexture(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number) {
  ctx.fillStyle = "#f0e8d8";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(180,160,120,0.04)";
  for (let i = 0; i < w; i += 3) {
    for (let j = 0; j < h; j += 3) {
      if (Math.random() > 0.5) ctx.fillRect(i, j, 2, 2);
    }
  }
  drawLogo(ctx, data.channelLogo, 50, 40, 130, 50);
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(50, 110, 60, 4);
  ctx.font = `800 56px ${BENGALI_FONT}`;
  ctx.fillStyle = "#2c1810";
  ctx.textBaseline = "top";
  const endY = wrapText(ctx, data.headline, 50, 130, w - 100, 70, "left");
  drawBadge(ctx, data.category, 50 + 60, endY + 20, "#8d6e63", "#f0e8d8", undefined, 22);
  ctx.font = `400 20px ${SANS_FONT}`;
  ctx.fillStyle = "#8d6e63";
  ctx.textAlign = "left";
  ctx.fillText(data.viaText, 50, endY + 70);
  if (data.mainPhoto) {
    drawImageCover(ctx, data.mainPhoto, 0, h * 0.55, w, h * 0.45);
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
  ctx.font = `900 66px ${HEADLINE_FONT}`;
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
    drawImageCover(ctx, data.mainPhoto, w * 0.2, h * 0.5, w * 0.6, h * 0.4);
    ctx.restore();
    ctx.strokeStyle = "#ff6ec7";
    ctx.lineWidth = 2;
    roundedRect(ctx, w * 0.2, h * 0.5, w * 0.6, h * 0.4, 8);
    ctx.stroke();
  }
  drawBottomTicker(ctx, w, h, "#ff6ec7");
  drawOtvWatermark(ctx, data);
}

const renderLuxuryBlack = makePremiumCard("#0a0a0a", "#000000", "#d4af37", "rgba(212,175,55,0.15)", "rgba(212,175,55,0.08)");
const renderRoyalPurple = makePremiumCard("#0f0020", "#050010", "#9c27b0", "rgba(156,39,176,0.2)", "rgba(156,39,176,0.1)");
const renderFireRed = makePremiumCard("#1a0000", "#0a0000", "#ff1744", "rgba(255,23,68,0.15)", "rgba(255,23,68,0.08)");
const renderOceanDeep = makePremiumCard("#001030", "#000818", "#0288d1", "rgba(2,136,209,0.2)", "rgba(2,136,209,0.1)");

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
];
