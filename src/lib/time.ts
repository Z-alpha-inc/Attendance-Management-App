function clampMs(ms: number): number {
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.floor(ms));
}

/** Date | string → ms */
function toMs(d: Date | string | null | undefined): number {
  if (!d) return 0;
  const v = d instanceof Date ? d.getTime() : new Date(d).getTime();
  return Number.isFinite(v) ? v : 0;
}

/** JSTの日付キー（YYYY-MM-DD） */
export function todayKeyJST(now = new Date()): string {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(jst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** ================================
 *  表示用フォーマット
 * ================================ */

/** ミリ秒 → "hh:mm:ss"（リアルタイム） */
export function msToHMS(ms: number): string {
  const totalSec = Math.floor(clampMs(ms) / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** 分 → "hh:mm"（当月一覧用） */
export function minutesToHHMM(mins: number | null | undefined): string {
  if (mins == null) return '-';
  const v = Math.max(0, Math.floor(mins));
  const h = Math.floor(v / 60);
  const m = v % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

/** ================================
 *  勤務・休憩時間の計算
 * ================================ */

/** 勤務総時間（出勤～退勤） */
export function totalWorkMs(
  clockIn: Date | string,
  clockOutOrNow: Date | string
): number {
  const s = toMs(clockIn);
  const e = toMs(clockOutOrNow);
  return clampMs(e - s);
}

/** 休憩合計ミリ秒 */
export function totalBreakMs(
  breaks: { start: Date | string; end: Date | string | null }[],
  ref: Date | string = new Date()
): number {
  const refMs = toMs(ref);
  return breaks.reduce((sum, b) => {
    const s = toMs(b.start);
    const e = toMs(b.end ?? new Date(refMs));
    const dur = clampMs(e - s);
    return sum + dur;
  }, 0);
}

/** 実働ミリ秒（休憩を除外） */
export function workingMsExcludingBreaks(
  clockIn: Date | string,
  clockOutOrNow: Date | string,
  breaks: { start: Date | string; end: Date | string | null }[] = []
): number {
  const total = totalWorkMs(clockIn, clockOutOrNow);
  const breakMs = totalBreakMs(breaks, clockOutOrNow);
  return Math.max(0, total - breakMs);
}

/** ================================
 *  保存・集計用（分単位）
 * ================================ */

/** ミリ秒 → 分 */
export function msToMinutes(ms: number): number {
  return Math.floor(clampMs(ms) / 60_000);
}

/** 実働分（休憩を除外） */
export function workingMinutesExcludingBreaks(
  clockIn: Date | string,
  clockOutOrNow: Date | string,
  breaks: { start: Date | string; end: Date | string | null }[] = []
): number {
  return msToMinutes(workingMsExcludingBreaks(clockIn, clockOutOrNow, breaks));
}

/** 休憩合計（分） */
export function totalBreakMinutes(
  breaks: { start: Date | string; end: Date | string | null }[],
  ref: Date | string = new Date()
): number {
  return msToMinutes(totalBreakMs(breaks, ref));
}
