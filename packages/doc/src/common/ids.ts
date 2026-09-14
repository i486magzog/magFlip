const ID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ID_LENGTH = 21;

/**
 * Returns a random id of 21 base62 characters (~125 bits).
 * Works in browsers, Node.js and Cloudflare Workers.
 */
export function createId(): string {
  // 248 is the largest multiple of 62 below 256; dropping bytes above it keeps the distribution uniform.
  const maxUnbiasedByte = 248;
  let id = '';
  while (id.length < ID_LENGTH) {
    const bytes = new Uint8Array(ID_LENGTH);
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= maxUnbiasedByte) { continue; }
      id += ID_ALPHABET[byte % 62];
      if (id.length === ID_LENGTH) { break; }
    }
  }
  return id;
}
