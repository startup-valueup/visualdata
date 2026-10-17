// 데이터에서 계산하는 값과 안내 문장. DOM/ECharts 의존성이 없는 순수 모듈이다.
import {fmtInt, fmtPct} from "./format.js";

const sum = (rows, key) => rows.reduce((s, d) => s + d[key], 0);

// 마지막 글자의 받침 유무에 따라 은/는 을 붙인다. (괄호 등으로 끝나면 '는')
function topic(text) {
  const code = text.charCodeAt(text.length - 1) - 0xac00;
  const hasFinal = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${text}${hasFinal ? "은" : "는"}`;
}

// 히어로 통계. 관측 기간은 yearly 의 최소·최대 연도에서 계산한다.
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

// 05 지도: 영업 중 매장 중 점으로 그려진 매장 수와 빠진 이유.
// active_now(인허가 건 기준) - unique_locations_active(브랜드+주소 중복 제거) = 동일 주소 중복,
// unique_locations_active - 좌표 있는 점 = 좌표 정보 없음.
export function mapCoverage(coffee, brand = null) {
  const summary = brand ? coffee.summary.filter((d) => d.brand === brand) : coffee.summary;
  const points = brand ? coffee.points.filter((p) => p.b === brand).length : coffee.points.length;
  const active = sum(summary, "active_now");
  const unique = sum(summary, "unique_locations_active");
  return {
    active,
    plotted: points,
    missing: active - points,
    duplicates: active - unique,
    noCoords: unique - points,
    uniqueActive: unique,
    plottedPct: (100 * points) / active
  };
}

export function mapCoverageNote(coffee, brand = null) {
  const all = mapCoverage(coffee);
  let text =
    `영업 중 매장 ${fmtInt(all.active)}곳 중 좌표가 있어 지도에 표시된 매장은 ${fmtInt(all.plotted)}곳(${fmtPct(all.plottedPct)})이며, ` +
    `나머지 ${fmtInt(all.missing)}곳은 좌표 정보가 없거나(${fmtInt(all.noCoords)}곳) 같은 주소의 중복 인허가 건(${fmtInt(all.duplicates)}곳)이라 점으로 표시되지 않았습니다. ` +
    `시도별 색의 진하기는 중복을 제거한 영업 중 매장 ${fmtInt(all.uniqueActive)}곳 기준이라 점의 개수와 정확히 일치하지 않을 수 있습니다.`;
  if (brand) {
    const b = mapCoverage(coffee, brand);
    text += ` ${brand}는 영업 중 ${fmtInt(b.active)}곳 중 ${fmtInt(b.plotted)}곳(${fmtPct(b.plottedPct)})이 표시됩니다.`;
  }
  return text;
}

// 04 생존 기간: 1년 미만 폐업 비중과 브랜드별 최근 개업 비중.
const UNDER_ONE_YEAR = ["3개월 미만", "3~6개월", "6개월~1년"];
const RECENT_YEARS = 5; // 최근 5년(관측 마지막 해 포함)
const NEWCOMER_RECENT_PCT = 40; // 최근 5년 개업 비중이 이 값 이상이면 '신생'으로 본다.

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
  // 신생인데도 1년 미만 폐업 비중이 평균 이하인 브랜드(구조적 설명만으로는 부족한 반례)
  const counterexamples = rows.filter((r) => r.recentPct >= NEWCOMER_RECENT_PCT && r.underPct <= avgUnderPct);
  return {rows, avgUnderPct, high, newcomers, nonNewcomers, counterexamples, fromYear, maxYear};
}

const brandList = (rows) => rows.map((r) => `${r.brand} ${fmtPct(r.underPct)}`).join(" · ");

export function survivalDescription(coffee) {
  const s = survivalInsight(coffee);
  const names = (rows) => rows.map((r) => r.brand).join("·");
  const lo = Math.round(Math.min(...s.newcomers.map((r) => r.recentPct)));
  const hi = Math.round(Math.max(...s.newcomers.map((r) => r.recentPct)));
  let text =
    `문을 닫은 매장만 골라, 개업부터 폐업까지 걸린 기간을 구간별 비율로 나눴습니다. ` +
    `폐업 매장 중 1년 미만에 문을 닫은 비중은 ${brandList(s.high)}로 전체 평균(${fmtPct(s.avgUnderPct)})보다 높게 나타납니다.`;
  if (s.newcomers.length) {
    text +=
      ` 이 중 ${topic(names(s.newcomers))} 인허가 건의 ${lo}~${hi}%가 최근 ${RECENT_YEARS}년(${s.fromYear}~${s.maxYear})에 몰린 신생 브랜드여서, ` +
      `관측된 생존기간 자체가 구조적으로 짧을 수 있으니 교체 주기가 빠르다고 단정하기는 어렵습니다.`;
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

// 04 읽는 법: 차트 구조 + 표본 크기 + 계산에서 빠진 폐업 건수.
export function survivalReadNote(coffee) {
  const {rows} = survivalInsight(coffee);
  const smallest = rows.reduce((a, b) => (b.closed < a.closed ? b : a));
  const excluded = sum(coffee.summary, "closed_total") - sum(rows, "closed");
  let text =
    `막대 하나가 한 브랜드의 폐업 매장 전체(100%)이고, 아래쪽 밝은 구간일수록 일찍 문을 닫은 매장입니다. ` +
    `브랜드는 1년 미만 폐업 비중이 높은 순입니다. 폐업 매장 수가 적은 브랜드(${smallest.brand} ${fmtInt(smallest.closed)}곳 등)는 비율이 크게 흔들릴 수 있습니다.`;
  if (excluded > 0) text += ` 개업·폐업일을 알 수 없거나 기간이 0일 이하인 폐업 ${fmtInt(excluded)}건은 제외했습니다.`;
  return text;
}

// 02 누적 매장 수: 마지막 해 누적값이 현재 영업 중 매장 수와 얼마나 다른지.
export function cumulativeGap(coffee) {
  const maxYear = Math.max(...coffee.cumulative.map((d) => d.year));
  const gaps = coffee.brands.map((brand) => {
    const cum = coffee.cumulative.find((d) => d.brand === brand && d.year === maxYear)?.cumulative_active ?? 0;
    const active = coffee.summary.find((d) => d.brand === brand).active_now;
    return Math.abs(active - cum);
  });
  return {maxYear, maxGap: Math.max(...gaps)};
}
