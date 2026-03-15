const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoShowDate(value: string) {
  return isoDatePattern.test(value);
}

export function deriveShowId(date: string) {
  return isIsoShowDate(date) ? `ss-${date}` : "";
}
