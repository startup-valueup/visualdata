export function fmtInt(n) {
  return Number(n).toLocaleString("ko-KR");
}

export function fmtPct(n, digits = 1) {
  return `${Number(n).toFixed(digits)}%`;
}
