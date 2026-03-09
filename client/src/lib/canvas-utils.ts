export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: "left" | "center" | "right" = "left"
): number {
  ctx.textAlign = align;
  const paragraphs = text.split("\n");
  let currentY = y;

  for (const para of paragraphs) {
    const words = para.split(" ").filter(w => w.length > 0);
    if (words.length === 0) {
      currentY += lineHeight;
      continue;
    }
    let line = "";
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[i] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(" ").filter(w => w.length > 0);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = "";
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line.trim());
        line = words[i] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
  }
  return lines;
}

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number,
  w: number, h: number,
  radius?: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;
  let sx: number, sy: number, sw: number, sh: number;

  if (imgRatio > targetRatio) {
    sh = img.naturalHeight;
    sw = sh * targetRatio;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / targetRatio;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  if (radius) {
    ctx.save();
    roundedRect(ctx, x, y, w, h, radius);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
}

export function createGradient(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number,
  x1: number, y1: number,
  stops: [number, string][]
): CanvasGradient {
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([offset, color]) => grad.addColorStop(offset, color));
  return grad;
}

export function createRadialGlow(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number,
  color: string,
  alpha: number
) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, color.replace(")", `, ${alpha})`).replace("rgb", "rgba"));
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

export function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  bgColor: string,
  textColor: string,
  borderColor?: string,
  fontSize: number = 36
) {
  ctx.font = `900 ${fontSize}px "Montserrat", "Noto Sans Bengali", sans-serif`;
  const metrics = ctx.measureText(text);
  const padX = 32;
  const padY = 14;
  const w = metrics.width + padX * 2;
  const h = fontSize + padY * 2;

  roundedRect(ctx, x - w / 2, y - h / 2, w, h, 8);
  ctx.fillStyle = bgColor;
  ctx.fill();

  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 2);
}

export function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number, y: number,
  maxW: number, maxH: number
) {
  if (!logo) return;
  const ratio = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight);
  const w = logo.naturalWidth * ratio;
  const h = logo.naturalHeight * ratio;
  ctx.drawImage(logo, x, y, w, h);
}

export function drawViaText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  color: string = "#ffffff",
  fontSize: number = 26
) {
  ctx.font = `500 ${fontSize}px "Montserrat", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.globalAlpha = 0.9;
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

export function drawPhotoCredit(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  vertical: boolean = true,
  color: string = "#c0c0c0"
) {
  ctx.save();
  ctx.font = `400 18px "Montserrat", sans-serif`;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;

  if (vertical) {
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "left";
    ctx.fillText(text, 0, 0);
  } else {
    ctx.textAlign = "left";
    ctx.fillText(text, x, y);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawBottomTicker(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  color: string = "#ffc107"
) {
  ctx.fillStyle = color;
  ctx.fillRect(0, h - 4, w, 4);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function drawGridLines(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  spacing: number = 40,
  color: string = "rgba(100,100,100,0.08)"
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  for (let i = x; i <= x + w; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i, y);
    ctx.lineTo(i, y + h);
    ctx.stroke();
  }
  for (let i = y; i <= y + h; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, i);
    ctx.lineTo(x + w, i);
    ctx.stroke();
  }
}

export function drawHighlightedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  fontSize: number,
  textColor: string,
  highlightColor: string,
  lineHeight: number,
  font: string,
  align: "left" | "center" = "left",
  padX: number = 14,
  padY: number = 6
): number {
  ctx.font = `800 ${fontSize}px ${font}`;
  ctx.textBaseline = "top";
  const lines = wrapTextLines(ctx, text, maxWidth - padX * 2);
  let currentY = y;
  for (const line of lines) {
    if (line.trim() === "") { currentY += lineHeight; continue; }
    const m = ctx.measureText(line);
    const lw = m.width + padX * 2;
    const lh = fontSize + padY * 2;
    const lx = align === "center" ? x - lw / 2 : x;
    ctx.fillStyle = highlightColor;
    ctx.fillRect(lx, currentY, lw, lh);
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.fillText(line, lx + padX, currentY + padY);
    currentY += lineHeight;
  }
  return currentY;
}

export function drawCircularImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number, cy: number,
  radius: number,
  borderColor?: string,
  borderWidth: number = 4
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  drawImageCover(ctx, img, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawPaperTexture(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  baseColor: string = "#f5f0e8",
  intensity: number = 0.035
) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * intensity;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.95));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.85));
  }
  ctx.putImageData(imageData, 0, 0);
}

export function drawSandyGrain(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  intensity: number = 0.06,
  warm: boolean = true
) {
  ctx.save();
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 16) {
    const grain = (Math.random() - 0.5) * 255 * intensity;
    for (let j = 0; j < 16 && i + j + 3 < data.length; j += 4) {
      data[i + j] = Math.min(255, Math.max(0, data[i + j] + grain + (warm ? 3 : 0)));
      data[i + j + 1] = Math.min(255, Math.max(0, data[i + j + 1] + grain + (warm ? 1 : 0)));
      data[i + j + 2] = Math.min(255, Math.max(0, data[i + j + 2] + grain));
    }
  }
  ctx.putImageData(imageData, 0, 0);
  ctx.restore();
}

export function drawEditorialGrid(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  spacing: number = 50,
  color: string = "rgba(80,80,80,0.06)",
  fadeDir: "down" | "up" | "none" = "down"
) {
  ctx.save();
  for (let i = x; i <= x + w; i += spacing) {
    const progress = (i - x) / w;
    let alpha = 1;
    if (fadeDir === "down") alpha = 1 - (progress * 0.7);
    else if (fadeDir === "up") alpha = 0.3 + (progress * 0.7);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(i, y);
    ctx.lineTo(i, y + h);
    ctx.stroke();
  }
  for (let i = y; i <= y + h; i += spacing) {
    const progress = (i - y) / h;
    let alpha = 1;
    if (fadeDir === "down") alpha = 1 - (progress * 0.8);
    else if (fadeDir === "up") alpha = 0.2 + (progress * 0.8);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, i);
    ctx.lineTo(x + w, i);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawNoiseOverlay(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  opacity: number = 0.02
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = Math.random() * 40;
  }
  ctx.putImageData(imageData, 0, 0);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawAccentBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  color: string,
  glow: boolean = false
) {
  if (glow) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
}

export function drawImageCoverPositioned(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number,
  w: number, h: number,
  offsetX: number = 0,
  offsetY: number = 0,
  zoom: number = 1,
  radius?: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;
  let sw: number, sh: number;

  if (imgRatio > targetRatio) {
    sh = img.naturalHeight / zoom;
    sw = sh * targetRatio;
  } else {
    sw = img.naturalWidth / zoom;
    sh = sw / targetRatio;
  }

  const scaleToSource = img.naturalWidth / w;
  const srcOffX = -offsetX * scaleToSource;
  const srcOffY = -offsetY * scaleToSource;
  const centerX = (img.naturalWidth - sw) / 2;
  const centerY = (img.naturalHeight - sh) / 2;
  const sx = Math.max(0, Math.min(img.naturalWidth - sw, centerX + srcOffX));
  const sy = Math.max(0, Math.min(img.naturalHeight - sh, centerY + srcOffY));

  if (radius) {
    ctx.save();
    roundedRect(ctx, x, y, w, h, radius);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
}

export const BENGALI_FONT = '"Noto Sans Bengali", "Hind Siliguri", sans-serif';
export const HEADLINE_FONT = '"Montserrat", "Noto Sans Bengali", "Hind Siliguri", sans-serif';
export const SANS_FONT = '"Montserrat", sans-serif';

export const BANGLA_FONT_OPTIONS = [
  { id: "noto-sans", name: "Noto Sans Bengali", family: '"Noto Sans Bengali", sans-serif', bn: "\u09A8\u09CB\u099F\u09CB \u09B8\u09CD\u09AF\u09BE\u09A8\u09CD\u09B8", style: "modern" },
  { id: "noto-serif", name: "Noto Serif Bengali", family: '"Noto Serif Bengali", serif', bn: "\u09A8\u09CB\u099F\u09CB \u09B8\u09C7\u09B0\u09BF\u09AB", style: "elegant" },
  { id: "hind-siliguri", name: "Hind Siliguri", family: '"Hind Siliguri", sans-serif', bn: "\u09B9\u09BF\u09A8\u09CD\u09A6 \u09B6\u09BF\u09B2\u09BF\u0997\u09C1\u09DC\u09BF", style: "clean" },
  { id: "siyam-rupali", name: "SiyamRupali", family: '"SiyamRupali", sans-serif', bn: "\u09B8\u09BF\u09AF\u09BC\u09BE\u09AE\u09B0\u09C2\u09AA\u09BE\u09B2\u09C0", style: "classic" },
  { id: "solaiman-lipi", name: "SolaimanLipi", family: '"SolaimanLipi", sans-serif', bn: "\u09B8\u09CB\u09B2\u09BE\u0987\u09AE\u09BE\u09A8\u09B2\u09BF\u09AA\u09BF", style: "standard" },
  { id: "kalpurush", name: "Kalpurush", family: '"Kalpurush", sans-serif', bn: "\u0995\u09B2\u09CD\u09AA\u09C1\u09B0\u09C1\u09B7", style: "bold" },
  { id: "nikosh", name: "Nikosh", family: '"Nikosh", sans-serif', bn: "\u09A8\u09BF\u0995\u09B7", style: "editorial" },
  { id: "anek-bangla", name: "Anek Bangla", family: '"Anek Bangla", sans-serif', bn: "\u0985\u09A8\u09C7\u0995 \u09AC\u09BE\u0982\u09B2\u09BE", style: "modern" },
  { id: "baloo-da", name: "Baloo Da 2", family: '"Baloo Da 2", sans-serif', bn: "\u09AC\u09BE\u09B2\u09C1 \u09A6\u09BE", style: "playful" },
  { id: "tiro-bangla", name: "Tiro Bangla", family: '"Tiro Bangla", serif', bn: "\u099F\u09BF\u09B0\u09CB \u09AC\u09BE\u0982\u09B2\u09BE", style: "literary" },
  { id: "galada", name: "Galada", family: '"Galada", cursive', bn: "\u0997\u09BE\u09B2\u09BE\u09A6\u09BE", style: "decorative" },
  { id: "atma", name: "Atma", family: '"Atma", sans-serif', bn: "\u0986\u09A4\u09CD\u09AE\u09BE", style: "handwritten" },
  { id: "mukti", name: "Mukti", family: '"Mukti", sans-serif', bn: "\u09AE\u09C1\u0995\u09CD\u09A4\u09BF", style: "newspaper" },
  { id: "bangla", name: "Bangla", family: '"Bangla", sans-serif', bn: "\u09AC\u09BE\u0982\u09B2\u09BE", style: "standard" },
  { id: "akaash", name: "Akaash", family: '"Akaash", sans-serif', bn: "\u0986\u0995\u09BE\u09B6", style: "creative" },
  { id: "mina", name: "Mina", family: '"Mina", sans-serif', bn: "\u09AE\u09BF\u09A8\u09BE", style: "rounded" },
] as const;

export type BanglaFontId = typeof BANGLA_FONT_OPTIONS[number]['id'];

export interface GlassPanelOptions {
  bgColor?: string;
  opacity?: number;
  blur?: number;
  edgeGlow?: boolean;
  glossyStreak?: boolean;
}

export function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  radius: number,
  options: GlassPanelOptions = {}
) {
  const {
    bgColor = "rgba(255,255,255,0.12)",
    opacity = 0.15,
    edgeGlow = true,
    glossyStreak = true,
  } = options;

  ctx.save();

  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 8;
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = bgColor;
  ctx.globalAlpha = opacity / 0.15;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = bgColor;
  ctx.globalAlpha = opacity / 0.15;
  ctx.fill();
  ctx.restore();

  if (edgeGlow) {
    ctx.save();
    roundedRect(ctx, x, y, w, h, radius);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    roundedRect(ctx, x + 1, y + 1, w - 2, h - 2, radius - 1);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  roundedRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const innerGlow = ctx.createRadialGradient(
    x + w / 2, y + h / 2, 0,
    x + w / 2, y + h / 2, Math.max(w, h) * 0.6
  );
  innerGlow.addColorStop(0, "rgba(255,255,255,0.06)");
  innerGlow.addColorStop(1, "transparent");
  ctx.fillStyle = innerGlow;
  ctx.fillRect(x, y, w, h);

  if (glossyStreak) {
    const glossH = h * 0.35;
    const glossGrad = ctx.createLinearGradient(x, y, x, y + glossH);
    glossGrad.addColorStop(0, "rgba(255,255,255,0.15)");
    glossGrad.addColorStop(0.5, "rgba(255,255,255,0.05)");
    glossGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glossGrad;
    ctx.fillRect(x, y, w, glossH);
  }

  ctx.restore();
}

export function drawGlowBlobs(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  colors: string[],
  count: number = 4,
  intensity: number = 0.3
) {
  ctx.save();
  const positions = [
    { x: 0.2, y: 0.2 },
    { x: 0.8, y: 0.3 },
    { x: 0.3, y: 0.7 },
    { x: 0.7, y: 0.8 },
    { x: 0.5, y: 0.5 },
    { x: 0.15, y: 0.5 },
    { x: 0.85, y: 0.6 },
    { x: 0.5, y: 0.15 },
  ];

  for (let i = 0; i < Math.min(count, positions.length); i++) {
    const color = colors[i % colors.length];
    const pos = positions[i];
    const blobR = Math.min(w, h) * (0.25 + (i % 3) * 0.1);
    const grad = ctx.createRadialGradient(
      w * pos.x, h * pos.y, 0,
      w * pos.x, h * pos.y, blobR
    );
    grad.addColorStop(0, color);
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = intensity;
    ctx.fillStyle = grad;
    ctx.fillRect(
      w * pos.x - blobR, h * pos.y - blobR,
      blobR * 2, blobR * 2
    );
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawGlassReflection(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  radius: number
) {
  ctx.save();
  roundedRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const streakH = h * 0.12;
  const streakY = y + h * 0.08;
  const grad = ctx.createLinearGradient(x, streakY, x + w, streakY + streakH);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.2, "rgba(255,255,255,0.18)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.25)");
  grad.addColorStop(0.8, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "transparent");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(
    x + w / 2, streakY + streakH / 2,
    w * 0.45, streakH / 2,
    -0.1, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

export function drawGradientMesh(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  colors: string[]
) {
  if (colors.length < 2) return;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, colors[0]);
  bg.addColorStop(1, colors[colors.length - 1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const meshPoints = [
    { x: 0, y: 0, r: Math.max(w, h) * 0.7 },
    { x: w, y: 0, r: Math.max(w, h) * 0.6 },
    { x: 0, y: h, r: Math.max(w, h) * 0.65 },
    { x: w, y: h, r: Math.max(w, h) * 0.55 },
    { x: w * 0.5, y: h * 0.5, r: Math.max(w, h) * 0.5 },
  ];

  for (let i = 0; i < Math.min(colors.length, meshPoints.length); i++) {
    const pt = meshPoints[i];
    const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r);
    grad.addColorStop(0, colors[i]);
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalAlpha = 1;
}

export function drawGlassEdge(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  radius: number,
  color: string = "rgba(255,255,255,0.3)"
) {
  ctx.save();
  roundedRect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  roundedRect(ctx, x + 1, y + 1, w - 2, Math.min(h * 0.3, 40), radius - 1);
  const edgeGrad = ctx.createLinearGradient(x, y, x, y + Math.min(h * 0.3, 40));
  edgeGrad.addColorStop(0, "rgba(255,255,255,0.2)");
  edgeGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = edgeGrad;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export function drawGlassBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  bgColor: string,
  textColor: string,
  glowColor: string,
  fontSize: number = 32
) {
  ctx.font = `800 ${fontSize}px "Montserrat", "Noto Sans Bengali", sans-serif`;
  const metrics = ctx.measureText(text);
  const padX = 28;
  const padY = 12;
  const bw = metrics.width + padX * 2;
  const bh = fontSize + padY * 2;
  const bx = x - bw / 2;
  const by = y - bh / 2;
  const br = bh / 2;

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  roundedRect(ctx, bx, by, bw, bh, br);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.restore();

  roundedRect(ctx, bx, by, bw, bh, br);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const glossGrad = ctx.createLinearGradient(bx, by, bx, by + bh * 0.5);
  glossGrad.addColorStop(0, "rgba(255,255,255,0.2)");
  glossGrad.addColorStop(1, "transparent");
  ctx.save();
  roundedRect(ctx, bx, by, bw, bh, br);
  ctx.clip();
  ctx.fillStyle = glossGrad;
  ctx.fillRect(bx, by, bw, bh * 0.5);
  ctx.restore();

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 1);
}

function drawPremiumSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const r = size * 0.5;
  const innerR = r * 0.25;
  const points = 4;

  ctx.shadowColor = "rgba(255,215,0,0.8)";
  ctx.shadowBlur = size * 0.6;

  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, "#fffbe6");
  grad.addColorStop(0.3, "#ffd700");
  grad.addColorStop(0.7, "#ffaa00");
  grad.addColorStop(1, "rgba(255,170,0,0)");
  ctx.fillStyle = grad;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : innerR;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPremiumFire(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const s = size * 0.5;

  ctx.shadowColor = "rgba(255,100,0,0.7)";
  ctx.shadowBlur = size * 0.5;

  const outerGrad = ctx.createRadialGradient(x, y + s * 0.2, 0, x, y - s * 0.3, s * 1.2);
  outerGrad.addColorStop(0, "#fff7a0");
  outerGrad.addColorStop(0.3, "#ffcc00");
  outerGrad.addColorStop(0.6, "#ff6600");
  outerGrad.addColorStop(1, "rgba(255,0,0,0)");

  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.bezierCurveTo(x + s * 0.3, y - s * 0.6, x + s * 0.7, y - s * 0.2, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.6, y + s * 0.1, x + s * 0.4, y + s * 0.6, x, y + s * 0.7);
  ctx.bezierCurveTo(x - s * 0.4, y + s * 0.6, x - s * 0.6, y + s * 0.1, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.7, y - s * 0.2, x - s * 0.3, y - s * 0.6, x, y - s);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  const innerGrad = ctx.createRadialGradient(x, y + s * 0.15, 0, x, y - s * 0.1, s * 0.6);
  innerGrad.addColorStop(0, "rgba(255,255,220,0.9)");
  innerGrad.addColorStop(0.5, "rgba(255,200,50,0.5)");
  innerGrad.addColorStop(1, "rgba(255,150,0,0)");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.4);
  ctx.bezierCurveTo(x + s * 0.2, y - s * 0.2, x + s * 0.25, y + s * 0.1, x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 0.25, y + s * 0.1, x - s * 0.2, y - s * 0.2, x, y - s * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPremiumCrown(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const s = size * 0.5;

  ctx.shadowColor = "rgba(255,215,0,0.6)";
  ctx.shadowBlur = size * 0.4;

  const grad = ctx.createLinearGradient(x - s, y - s * 0.5, x + s, y + s * 0.5);
  grad.addColorStop(0, "#ffd700");
  grad.addColorStop(0.3, "#ffec80");
  grad.addColorStop(0.5, "#ffd700");
  grad.addColorStop(0.7, "#daa520");
  grad.addColorStop(1, "#b8860b");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x - s, y + s * 0.4);
  ctx.lineTo(x - s, y - s * 0.2);
  ctx.lineTo(x - s * 0.5, y + s * 0.05);
  ctx.lineTo(x, y - s * 0.5);
  ctx.lineTo(x + s * 0.5, y + s * 0.05);
  ctx.lineTo(x + s, y - s * 0.2);
  ctx.lineTo(x + s, y + s * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(180,130,20,0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.shadowBlur = 0;
  const jewels = [
    { cx: x, cy: y - s * 0.1, color: "#ff0040", r: s * 0.12 },
    { cx: x - s * 0.5, cy: y + s * 0.05, color: "#00bfff", r: s * 0.08 },
    { cx: x + s * 0.5, cy: y + s * 0.05, color: "#00ff80", r: s * 0.08 },
  ];
  for (const j of jewels) {
    const jGrad = ctx.createRadialGradient(j.cx - j.r * 0.3, j.cy - j.r * 0.3, 0, j.cx, j.cy, j.r);
    jGrad.addColorStop(0, "rgba(255,255,255,0.9)");
    jGrad.addColorStop(0.4, j.color);
    jGrad.addColorStop(1, j.color);
    ctx.fillStyle = jGrad;
    ctx.beginPath();
    ctx.arc(j.cx, j.cy, j.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(x - s, y + s * 0.3, s * 2, s * 0.1);

  ctx.restore();
}

function drawPremiumHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const s = size * 0.45;

  ctx.shadowColor = "rgba(255,50,80,0.6)";
  ctx.shadowBlur = size * 0.5;

  const grad = ctx.createRadialGradient(x - s * 0.2, y - s * 0.3, 0, x, y, s * 1.3);
  grad.addColorStop(0, "#ff6b8a");
  grad.addColorStop(0.4, "#ff1744");
  grad.addColorStop(1, "#c51162");
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.8);
  ctx.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.8, y - s * 1.1, x, y - s * 0.4);
  ctx.bezierCurveTo(x + s * 0.8, y - s * 1.1, x + s * 1.5, y - s * 0.1, x, y + s * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  const shineGrad = ctx.createRadialGradient(x - s * 0.35, y - s * 0.35, 0, x - s * 0.2, y - s * 0.2, s * 0.5);
  shineGrad.addColorStop(0, "rgba(255,255,255,0.6)");
  shineGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shineGrad;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.3, y - s * 0.3, s * 0.25, s * 0.2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPremiumLightning(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const s = size * 0.5;

  ctx.shadowColor = "rgba(100,200,255,0.8)";
  ctx.shadowBlur = size * 0.6;

  const grad = ctx.createLinearGradient(x, y - s, x, y + s);
  grad.addColorStop(0, "#80d8ff");
  grad.addColorStop(0.3, "#40c4ff");
  grad.addColorStop(0.6, "#00b0ff");
  grad.addColorStop(1, "#0091ea");
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(x + s * 0.1, y - s);
  ctx.lineTo(x - s * 0.4, y - s * 0.05);
  ctx.lineTo(x + s * 0.05, y - s * 0.05);
  ctx.lineTo(x - s * 0.15, y + s);
  ctx.lineTo(x + s * 0.45, y + s * 0.05);
  ctx.lineTo(x, y + s * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.moveTo(x + s * 0.05, y - s * 0.8);
  ctx.lineTo(x - s * 0.2, y - s * 0.1);
  ctx.lineTo(x + s * 0.02, y - s * 0.1);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPremiumStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const r = size * 0.5;
  const innerR = r * 0.4;
  const points = 5;

  ctx.shadowColor = "rgba(255,215,0,0.7)";
  ctx.shadowBlur = size * 0.5;

  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, "#fffde7");
  grad.addColorStop(0.3, "#ffd54f");
  grad.addColorStop(0.7, "#ffb300");
  grad.addColorStop(1, "rgba(255,160,0,0.3)");
  ctx.fillStyle = grad;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : innerR;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(x - r * 0.15, y - r * 0.15, r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPremiumVerified(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const r = size * 0.45;

  ctx.shadowColor = "rgba(30,136,229,0.7)";
  ctx.shadowBlur = size * 0.4;

  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  grad.addColorStop(0, "#42a5f5");
  grad.addColorStop(0.5, "#1e88e5");
  grad.addColorStop(1, "#1565c0");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - r * 0.35, y + r * 0.05);
  ctx.lineTo(x - r * 0.05, y + r * 0.35);
  ctx.lineTo(x + r * 0.4, y - r * 0.3);
  ctx.stroke();

  ctx.restore();
}

function drawPremiumThumbsUp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const s = size * 0.45;

  ctx.shadowColor = "rgba(255,193,7,0.5)";
  ctx.shadowBlur = size * 0.3;

  const grad = ctx.createRadialGradient(x, y, 0, x, y, s * 1.2);
  grad.addColorStop(0, "#ffecb3");
  grad.addColorStop(0.5, "#ffc107");
  grad.addColorStop(1, "#ff8f00");
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y - s * 0.7);
  ctx.bezierCurveTo(x - s * 0.15, y - s * 0.9, x + s * 0.15, y - s * 0.9, x + s * 0.2, y - s * 0.6);
  ctx.lineTo(x + s * 0.5, y - s * 0.6);
  ctx.bezierCurveTo(x + s * 0.65, y - s * 0.6, x + s * 0.65, y - s * 0.3, x + s * 0.5, y - s * 0.3);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 0.3, x + s * 0.6, y - s * 0.05, x + s * 0.45, y - s * 0.05);
  ctx.bezierCurveTo(x + s * 0.55, y - s * 0.05, x + s * 0.55, y + s * 0.2, x + s * 0.4, y + s * 0.2);
  ctx.lineTo(x - s * 0.1, y + s * 0.2);
  ctx.lineTo(x - s * 0.1, y - s * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = grad;
  roundedRect(ctx, x - s * 0.5, y - s * 0.05, s * 0.35, s * 0.75, s * 0.08);
  ctx.fill();

  ctx.restore();
}

function drawPremiumWow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const r = size * 0.45;

  ctx.shadowColor = "rgba(255,193,7,0.5)";
  ctx.shadowBlur = size * 0.3;

  const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
  grad.addColorStop(0, "#fff9c4");
  grad.addColorStop(0.5, "#fdd835");
  grad.addColorStop(1, "#f9a825");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.15, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.15, r * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.3, r * 0.15, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3e2723";
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.32, r * 0.12, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

const EMOJI_RENDERERS: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => void> = {
  "\u2728": drawPremiumSparkle,
  "\u2B50": drawPremiumStar,
  "\u26A1": drawPremiumLightning,
  "\uD83D\uDD25": drawPremiumFire,
  "\uD83D\uDC51": drawPremiumCrown,
  "\u2764\uFE0F": drawPremiumHeart,
  "\uD83D\uDC9C": drawPremiumHeart,
  "\u2764": drawPremiumHeart,
  "\uD83C\uDF1F": drawPremiumStar,
  "\uD83D\uDCAF": drawPremiumVerified,
  "\uD83D\uDE0D": drawPremiumWow,
  "\uD83D\uDC4D": drawPremiumThumbsUp,
  "\u2705": drawPremiumVerified,
  "\uD83D\uDE2E": drawPremiumWow,
  "\uD83D\uDCA0": drawPremiumSparkle,
  "\uD83D\uDD36": drawPremiumStar,
  "\uD83C\uDF89": drawPremiumSparkle,
  "\uD83C\uDF8A": drawPremiumSparkle,
  "\uD83C\uDF86": drawPremiumStar,
  "\uD83D\uDE80": drawPremiumLightning,
  "\uD83E\uDD16": drawPremiumVerified,
  "\uD83D\uDD2E": drawPremiumSparkle,
  "\uD83D\uDEA8": drawPremiumFire,
  "\u26A0\uFE0F": drawPremiumLightning,
  "\uD83D\uDD34": drawPremiumFire,
  "\uD83D\uDCAC": drawPremiumVerified,
  "\uD83C\uDF38": drawPremiumHeart,
  "\uD83C\uDF3C": drawPremiumStar,
  "\uD83E\uDD8B": drawPremiumSparkle,
  "\uD83D\uDCF0": drawPremiumVerified,
  "\u270D\uFE0F": drawPremiumSparkle,
  "\uD83D\uDCDD": drawPremiumVerified,
};

export function drawDecorativeEmoji(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  x: number, y: number,
  size: number = 40,
  opacity: number = 0.7,
  glow: boolean = true
) {
  ctx.save();

  if (glow) {
    const bubbleR = size * 0.6;
    const bubbleGrad = ctx.createRadialGradient(x, y, 0, x, y, bubbleR);
    bubbleGrad.addColorStop(0, "rgba(255,255,255,0.08)");
    bubbleGrad.addColorStop(0.6, "rgba(255,255,255,0.03)");
    bubbleGrad.addColorStop(1, "transparent");
    ctx.fillStyle = bubbleGrad;
    ctx.beginPath();
    ctx.arc(x, y, bubbleR, 0, Math.PI * 2);
    ctx.fill();
  }

  const renderer = EMOJI_RENDERERS[emoji];
  if (renderer) {
    renderer(ctx, x, y, size, opacity);
  } else {
    ctx.globalAlpha = opacity;
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x, y);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

export function drawSparkles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  count: number = 12,
  color: string = "rgba(255,255,255,0.8)"
) {
  ctx.save();
  const seed = (x * 7 + y * 13 + w * 3) % 1000;
  for (let i = 0; i < count; i++) {
    const hash = ((seed + i * 137) % 997) / 997;
    const hash2 = ((seed + i * 251) % 991) / 991;
    const sx = x + hash * w;
    const sy = y + hash2 * h;
    const sparkSize = 2 + hash * 4;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4 + hash2 * 0.6;

    ctx.beginPath();
    ctx.moveTo(sx, sy - sparkSize);
    ctx.lineTo(sx + sparkSize * 0.3, sy - sparkSize * 0.3);
    ctx.lineTo(sx + sparkSize, sy);
    ctx.lineTo(sx + sparkSize * 0.3, sy + sparkSize * 0.3);
    ctx.lineTo(sx, sy + sparkSize);
    ctx.lineTo(sx - sparkSize * 0.3, sy + sparkSize * 0.3);
    ctx.lineTo(sx - sparkSize, sy);
    ctx.lineTo(sx - sparkSize * 0.3, sy - sparkSize * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawGlowRing(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number,
  color: string,
  width: number = 3
) {
  ctx.save();

  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - width, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawFloatingOrbs(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  colors: string[],
  count: number = 6
) {
  ctx.save();
  const orbPositions = [
    { x: 0.12, y: 0.15, s: 0.06 },
    { x: 0.88, y: 0.22, s: 0.04 },
    { x: 0.75, y: 0.75, s: 0.05 },
    { x: 0.2, y: 0.82, s: 0.035 },
    { x: 0.55, y: 0.12, s: 0.03 },
    { x: 0.4, y: 0.65, s: 0.045 },
    { x: 0.65, y: 0.45, s: 0.025 },
    { x: 0.1, y: 0.5, s: 0.04 },
  ];

  for (let i = 0; i < Math.min(count, orbPositions.length); i++) {
    const pos = orbPositions[i];
    const color = colors[i % colors.length];
    const orbR = Math.min(w, h) * pos.s;
    const ox = w * pos.x;
    const oy = h * pos.y;

    const grad = ctx.createRadialGradient(
      ox - orbR * 0.3, oy - orbR * 0.3, 0,
      ox, oy, orbR
    );
    grad.addColorStop(0, "rgba(255,255,255,0.25)");
    grad.addColorStop(0.4, color);
    grad.addColorStop(1, "transparent");

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ox, oy, orbR * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
