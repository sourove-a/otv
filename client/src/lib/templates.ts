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
];
