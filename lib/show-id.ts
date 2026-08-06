const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const showIdPattern = /^ss-[0-9a-f]{8}$/;

export function isIsoShowDate(value: string) {
  return isoDatePattern.test(value);
}

export function isShowId(value: string) {
  return showIdPattern.test(value);
}

export function generateShowId() {
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);

  const randomHex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  return `ss-${randomHex}`;
}
