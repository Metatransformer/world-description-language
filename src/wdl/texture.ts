import { deflateSync } from "node:zlib";
import type { ProceduralTexture } from "./types.js";

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const tag = Buffer.from(type),
    length = Buffer.alloc(4),
    checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([tag, data])));
  return Buffer.concat([length, tag, data, checksum]);
}

/** A saved PNG makes a procedural material consumable without running WDL. */
export function texturePng(texture: ProceduralTexture): Buffer {
  const size = 64,
    pixels = Buffer.alloc(size * (size * 3 + 1));
  const colors = texture.colors.map((color) => {
    const hex = color.slice(1);
    const normalized =
      hex.length === 3 ? [...hex].map((value) => value + value).join("") : hex;
    return [0, 2, 4].map((offset) =>
      parseInt(normalized.slice(offset, offset + 2), 16),
    );
  });
  let seed =
    [...(texture.seed ?? "wdl")].reduce(
      (hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619),
      2166136261,
    ) >>> 0;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const mix =
        texture.kind === "noise"
          ? seed / 4294967295
          : texture.kind === "checker"
            ? (Math.floor(x / 8) + Math.floor(y / 8)) % 2
            : Math.floor(x / 8) % 2;
      const offset = y * (size * 3 + 1) + 1 + x * 3;
      for (let channel = 0; channel < 3; channel++)
        pixels[offset + channel] = Math.round(
          colors[0]![channel]! * (1 - mix) + colors[1]![channel]! * mix,
        );
    }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
