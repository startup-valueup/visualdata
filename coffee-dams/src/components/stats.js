// 데이터에서 계산하는 값과 안내 문장. DOM/차트 의존성이 없는 순수 모듈이다.
import {fmtInt, fmtPct} from "./format.js";

const sum = (rows, key) => rows.reduce((s, d) => s + d[key], 0);

// 마지막 글자의 받침 유무에 따라 은/는을 붙인다.
function topic(text) {
  const code = text.charCodeAt(text.length - 1) - 0xac00;
  const hasFinal = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${text}${hasFinal ? "은" : "는"}`;
}

export const BUCKETS = ["3개월 미만", "3~6개월", "6개월~1년", "1~2년", "2~5년", "5년 이상"];
export const DIST_BUCKETS = ["250m 이내", "250~500m", "500m~1km", "1~2km", "2km 이상"];
const UNDER_ONE_YEAR = BUCKETS.slice(0, 3);
const RECENT_YEARS = 5; // 최근 5년(관측 마지막 해 포함)
const NEWCOMER_RECENT_PCT = 40; // 최근 5년 개업 비중이 이 값 이상이면 '신생'으로 본다.
const SMALL_SAMPLE = 100; // 폐업 매장이 이보다 적으면 비율이 크게 흔들릴 수 있다고 안내한다.

// 개요: 핵심 숫자. 관측 기간은 yearly 의 최소·최대 연도에서 계산한다.
export function heroStats(coffee) {
  const {summary, yearly, brands} = coffee;
  const years = yearly.map((d) => d.year);
  return {
    active: sum(summary, "active_now"),
    closed: sum(summary, "closed_total"),
    episodes: sum(summary, "total_episodes"),
    vending: sum(summary, "vending_count"),
    brandCount: brands.length,
    minYear: Math.min(...years),
    maxYear: Math.max(...years)
  };
}

// 지도: 영업 중 매장 중 점으로 그려진 매장 수와 빠진 이유.
// active_now(인허가 건 기준) - unique_locations_active(브랜드+주소 중복 제거) = 동일 주소 중복,
// unique_locations_active - 좌표 있는 점 = 좌표 정보 없음.
export function mapCoverage(coffee, brand = null) {
  const summary = brand ? coffee.summary.filter((d) => d.brand === brand) : coffee.summary;
  const points = brand ? coffee.points.filter((p) => p.b === brand).length : coffee.points.length;
  const active = sum(summary, "active_now");
  const unique = sum(summary, "unique_locations_active");
  return {active, plotted: points, missing: active - points, duplicates: active - unique, noCoords: unique - points, uniqueActive: unique, plottedPct: (100 * points) / active};
}

export function mapCoverageNote(coffee, brand = null) {
  const c = mapCoverage(coffee, brand);
  const who = brand ? `${brand} 영업 중 매장` : "영업 중 매장";
  return (
    `${who} ${fmtInt(c.active)}곳 중 좌표가 있어 지도에 표시된 매장은 ${fmtInt(c.plotted)}곳(${fmtPct(c.plottedPct)})이며, ` +
    `나머지 ${fmtInt(c.missing)}곳은 좌표 정보가 없거나(${fmtInt(c.noCoords)}곳) 같은 주소의 중복 인허가 건(${fmtInt(c.duplicates)}곳)이라 점으로 표시되지 않았습니다.`
  );
}

// 생존기간: 브랜드별 폐업 건수, 1년 미만 폐업 비중, 최근 개업 비중.
export function survivalInsight(coffee) {
  const {brands, survival_hist, yearly} = coffee;
  const maxYear = Math.max(...yearly.map((d) => d.year));
  const fromYear = maxYear - RECENT_YEARS + 1;
  let closedAll = 0;
  let underAll = 0;
  const rows = brands.map((brand) => {
    const hist = survival_hist.filter((d) => d.brand === brand);
    const closed = sum(hist, "count");
    const under = hist.filter((d) => UNDER_ONE_YEAR.includes(d.bucket)).reduce((s, d) => s + d.count, 0);
    const ys = yearly.filter((d) => d.brand === brand);
    const opened = sum(ys, "opened");
    const recent = ys.filter((d) => d.year >= fromYear).reduce((s, d) => s + d.opened, 0);
    closedAll += closed;
    underAll += under;
    return {brand, closed, underPct: closed ? (100 * under) / closed : 0, recentPct: opened ? (100 * recent) / opened : 0};
  });
  const avgUnderPct = (100 * underAll) / closedAll;
  const high = rows.filter((r) => r.underPct > avgUnderPct).sort((a, b) => b.underPct - a.underPct);
  const newcomers = high.filter((r) => r.recentPct >= NEWCOMER_RECENT_PCT);
  const nonNewcomers = high.filter((r) => r.recentPct < NEWCOMER_RECENT_PCT);
  const counterexamples = rows.filter((r) => r.recentPct >= NEWCOMER_RECENT_PCT && r.underPct <= avgUnderPct);
  return {rows, avgUnderPct, high, newcomers, nonNewcomers, counterexamples, fromYear, maxYear};
}

const brandList = (rows) => rows.map((r) => `${r.brand} ${fmtPct(r.underPct)}`).join(" · ");

// 개요 페이지: 생존기간 설명 (신생 브랜드의 구조적 한계 포함, 값은 모두 데이터에서 계산)
export function survivalDescription(coffee) {
  const s = survivalInsight(coffee);
  const names = (rows) => rows.map((r) => r.brand).join("·");
  let text = `문을 닫은 매장만 골라, 개업부터 폐업까지 걸린 기간을 구간별로 나눴습니다. 폐업 매장 중 1년 미만에 문을 닫은 비중은 ${brandList(s.high)}로 전체 평균(${fmtPct(s.avgUnderPct)})보다 높게 나타납니다.`;
  if (s.newcomers.length) {
    const lo = Math.round(Math.min(...s.newcomers.map((r) => r.recentPct)));
    const hi = Math.round(Math.max(...s.newcomers.map((r) => r.recentPct)));
    text += ` 이 중 ${topic(names(s.newcomers))} 인허가 건의 ${lo}~${hi}%가 최근 ${RECENT_YEARS}년(${s.fromYear}~${s.maxYear})에 몰린 신생 브랜드여서, 관측된 생존기간 자체가 구조적으로 짧을 수 있으니 교체 주기가 빠르다고 단정하기는 어렵습니다.`;
  }
  if (s.nonNewcomers.length) {
    const list = s.nonNewcomers.map((r) => `${r.brand}(${fmtPct(r.recentPct, 0)})`).join("·");
    text += ` ${topic(list)} 최근 ${RECENT_YEARS}년 개업 비중이 낮아 이 설명이 적용되지 않습니다.`;
  }
  if (s.counterexamples.length) {
    const list = s.counterexamples.map((r) => `${r.brand}(최근 개업 ${fmtPct(r.recentPct, 0)}, 1년 미만 폐업 ${fmtPct(r.underPct)})`).join(", ");
    text += ` 반대로 ${topic(list)} 신생인데도 1년 미만 폐업 비중이 평균 이하여서, 신생 여부만으로 차이가 설명되지는 않습니다.`;
  }
  return text;
}

// 브랜드 페이지: 해당 브랜드의 생존기간 해석 + 한계
export function brandSurvivalNote(coffee, brand) {
  const s = survivalInsight(coffee);
  const r = s.rows.find((d) => d.brand === brand);
  const higher = r.underPct > s.avgUnderPct;
  let text =
    `${brand}의 폐업 매장 ${fmtInt(r.closed)}곳 중 1년 미만에 문을 닫은 비중은 ${fmtPct(r.underPct)}로, 10개 브랜드 전체 평균(${fmtPct(s.avgUnderPct)})보다 ${higher ? "높습니다" : "낮거나 비슷합니다"}.`;
  const recent = `인허가 건의 ${fmtPct(r.recentPct, 0)}가 최근 ${RECENT_YEARS}년(${s.fromYear}~${s.maxYear})에 몰려 있습니다.`;
  if (r.recentPct >= NEWCOMER_RECENT_PCT) {
    text += ` ${recent} 신생 브랜드는 관측된 생존기간이 구조적으로 짧을 수 있어, 이 수치만으로 교체 주기가 빠르다고 단정하기는 어렵습니다.`;
  } else {
    text += ` ${recent} 상대적으로 오래된 브랜드라 관측 기간이 짧아서 생기는 영향은 작은 편입니다.`;
  }
  if (r.closed < SMALL_SAMPLE) text += ` 폐업 매장이 ${fmtInt(r.closed)}곳뿐이라 비율이 크게 흔들릴 수 있습니다.`;
  return text;
}

// 브랜드 페이지 KPI
export function brandSummary(coffee, brand) {
  const s = coffee.summary.find((d) => d.brand === brand);
  return {
    active: s.active_now,
    closed: s.closed_total,
    episodes: s.total_episodes,
    closureRate: s.closure_rate_pct,
    medianSurvivalDays: s.median_survival_days,
    vending: s.vending_count
  };
}

// 브랜드 × 구간 비율(%) — 각 브랜드의 폐업 매장을 100%로 본 분포
export function survivalShares(coffee) {
  const totals = Object.fromEntries(coffee.brands.map((b) => [b, sum(coffee.survival_hist.filter((d) => d.brand === b), "count")]));
  return coffee.survival_hist.map((d) => ({brand: d.brand, bucket: d.bucket, count: d.count, closed: totals[d.brand], pct: totals[d.brand] ? (100 * d.count) / totals[d.brand] : 0}));
}

// 전체 폐업 매장 기준 구간별 비율(%)
export function pooledSurvivalShares(coffee) {
  const total = sum(coffee.survival_hist, "count");
  return BUCKETS.map((bucket) => ({bucket, pct: (100 * sum(coffee.survival_hist.filter((d) => d.bucket === bucket), "count")) / total}));
}

// 생존기간 분포에서 빠진 폐업 건수 (개업·폐업일을 알 수 없거나 기간이 0일 이하인 건)
export function survivalExcluded(coffee) {
  return sum(coffee.summary, "closed_total") - sum(coffee.survival_hist, "count");
}
