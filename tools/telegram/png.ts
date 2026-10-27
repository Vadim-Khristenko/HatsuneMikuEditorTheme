import { deflateSync } from "node:zlib";
import { concat, crc32 } from "./zip";

function chunk(type: string, data: Uint8Array): Uint8Array {
  const head = new Uint8Array(8);
  const view = new DataView(head.buffer);
  view.setUint32(0, data.length);
  head.set(new TextEncoder().encode(type), 4);
  const crc = new Uint8Array(4);
  new DataView(crc.buffer).setUint32(0, crc32(data, crc32(head.subarray(4))));
  return concat([head, data, crc]);
}

/** An 8-bit RGB PNG from packed rgb rows. */
export function encodePng(rgb: Uint8Array, width: number, height: number): Uint8Array {
  const ihdr = new Uint8Array(13);
  const v = new DataView(ihdr.buffer);
  v.setUint32(0, width);
  v.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const stride = width * 3;
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (stride + 1);
    const src = y * stride;
    raw[row] = 1; // Sub filter: flat areas turn into runs of zeros
    for (let x = 0; x < stride; x++) raw[row + 1 + x] = (rgb[src + x] - (x >= 3 ? rgb[src + x - 3] : 0)) & 0xff;
  }
  return concat([
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", new Uint8Array()),
  ]);
}
