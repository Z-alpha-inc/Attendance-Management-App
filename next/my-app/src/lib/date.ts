export function todayKeyJST(now = new Date()): string {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC→JST
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}