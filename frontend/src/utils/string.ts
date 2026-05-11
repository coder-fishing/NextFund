export function truncate(str: string, max: number) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}
