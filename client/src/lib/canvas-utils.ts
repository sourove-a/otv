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
