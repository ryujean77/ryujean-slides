/* 같은 사람의 학습 기록 두 벌(이 브라우저 a, 계정 b) 합치기.
   완료는 합집합, 학습 시간은 수업별 큰 값, 노트·실습지·마지막 수업은 더 최근 기록 우선(실습지는 수업 단위), 로그는 중복 없이 최신 200개. */
export function merge(a, b) {
  a = a || {}; b = b || {};
  const done = { ...(b.done || {}), ...(a.done || {}) };
  const time = { ...(b.time || {}) };
  for (const [k, v] of Object.entries(a.time || {})) time[k] = Math.max(v, time[k] || 0);
  const newer = (a.lastAt || 0) >= (b.lastAt || 0) ? a : b;
  const older = newer === a ? b : a;
  const seen = new Set();
  const log = [...(a.log || []), ...(b.log || [])]
    .filter((l) => { const k = l.t + l.type + l.uid; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((x, y) => (x.t < y.t ? 1 : -1)).slice(0, 200);
  return { done, time, notes: { ...(older.notes || {}), ...(newer.notes || {}) }, sheets: { ...(older.sheets || {}), ...(newer.sheets || {}) }, log, last: newer.last || older.last || null, lastAt: newer.lastAt || older.lastAt || 0 };
}
