import { ICON_DATA_MAX } from "../settings";

const SIZE = 128;

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("not an image"));
    img.src = src;
  });
}

function draw(img: HTMLImageElement, cover: boolean): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const g = c.getContext("2d")!;
  // An SVG without width and height reports 0; it scales freely, so any square will do.
  const w = img.naturalWidth || SIZE;
  const h = img.naturalHeight || SIZE;
  const k = cover ? Math.max(SIZE / w, SIZE / h) : Math.min(SIZE / w, SIZE / h);
  g.imageSmoothingQuality = "high";
  g.drawImage(img, (SIZE - w * k) / 2, (SIZE - h * k) / 2, w * k, h * k);
  return c;
}

/** Transparent corners mean a logo on nothing: it is fitted inside the tile, anything else covers it. */
function cornersOpaque(c: HTMLCanvasElement): boolean {
  const g = c.getContext("2d")!;
  return [[2, 2], [SIZE - 3, 2], [2, SIZE - 3], [SIZE - 3, SIZE - 3]].every(([x, y]) => g.getImageData(x, y, 1, 1).data[3] > 230);
}

/** Turns a picked file into a small square picture that fits in the settings. */
export async function iconFromFile(file: File): Promise<{ src: string; fill: boolean }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await load(url);
    let c = draw(img, true);
    const fill = cornersOpaque(c);
    if (!fill) c = draw(img, false);
    let src = c.toDataURL("image/png");
    // Photos compress badly as PNG; a covering picture has no transparency to lose.
    if (src.length > ICON_DATA_MAX / 2 && fill) src = c.toDataURL("image/jpeg", 0.88);
    if (src.length > ICON_DATA_MAX) throw new Error("too big");
    return { src, fill };
  } finally {
    URL.revokeObjectURL(url);
  }
}
