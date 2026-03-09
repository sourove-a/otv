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

export const BENGALI_FONT = '"Noto Sans Bengali", "Hind Siliguri", sans-serif';
export const HEADLINE_FONT = '"Montserrat", "Noto Sans Bengali", "Hind Siliguri", sans-serif';
export const SANS_FONT = '"Montserrat", sans-serif';
