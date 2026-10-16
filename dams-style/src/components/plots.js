// Observable Plot 차트 모음. 브랜드 색상(coffee.colors)만 시리즈 색으로 쓰고, 나머지는 예제의 기본 모양을 따른다.
import * as Plot from "@observablehq/plot";
import {fmtInt, fmtPct, sidoShort} from "./format.js";
import {BUCKETS, DIST_BUCKETS, pooledSurvivalShares, survivalInsight, survivalShares} from "./stats.js";

// 구간 색: 예제의 조건 팔레트(주황~파랑) 계열. 브랜드 색과 구분되도록 브랜드 시리즈에는 쓰지 않는다.
const BUCKET_COLORS = ["#ff725c", "#f4934a", "#efb118", "#97bbf5", "#5c86e0", "#4269d0"];
const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
const MONTHS = Array.from({length: 12}, (_, i) => `${i + 1}월`);

const brandScale = (coffee) => ({domain: coffee.brands, range: coffee.brands.map((b) => coffee.colors[b])});

export function brandLegend(coffee) {
  return Plot.legend({color: {type: "categorical", ...brandScale(coffee)}});
}

// 개요 ③ 브랜드 × 생존기간 구간 버블 매트릭스 (원 크기 = 폐업 매장 수) — us-dams 의 '위험도 × 상태' 차트에 대응
export function survivalMatrix(coffee, width) {
  const rows = survivalShares(coffee).filter((d) => d.count > 0);
  return Plot.plot({
    width,
    height: 420,
    marginLeft: 100,
    marginBottom: 40,
    marginTop: 10,
    grid: true,
    x: {domain: BUCKETS, label: "개업부터 폐업까지"},
    y: {domain: coffee.brands, label: null},
    r: {range: [2, 24], label: "폐업 매장 수"},
    color: brandScale(coffee),
    marks: [
      Plot.dot(rows, {
        x: "bucket",
        y: "brand",
        r: "count",
        fill: "brand",
        fillOpacity: 0.85,
        stroke: "currentColor",
        strokeWidth: 0.5,
        tip: true,
        title: (d) => `${d.brand} · ${d.bucket}\n폐업 매장 ${fmtInt(d.count)}곳 (이 브랜드 폐업 매장의 ${fmtPct(d.pct)})`
      })
    ]
  });
}

// 개요: 브랜드별 생존기간 분포 — 각 브랜드의 폐업 매장을 100%로 본 막대 (브랜드를 한 막대에 합쳐 쌓지 않는다)
export function survivalShareBars(coffee, width) {
  const order = [...survivalInsight(coffee).rows].sort((a, b) => b.underPct - a.underPct).map((r) => r.brand);
  return Plot.plot({
    width,
    height: 420,
    marginLeft: 100,
    marginBottom: 40,
    marginTop: 10,
    x: {label: "해당 브랜드 폐업 매장 중 비율 (%)", domain: [0, 100], grid: true},
    y: {domain: order, label: null},
    color: {domain: BUCKETS, range: BUCKET_COLORS, legend: true, label: "폐업까지 걸린 기간"},
    marks: [
      Plot.barX(survivalShares(coffee), {
        x: "pct",
        y: "brand",
        fill: "bucket",
        order: BUCKETS,
        rx: 2,
        insetRight: 0.5,
        tip: true,
        title: (d) => `${d.brand} · ${d.bucket}\n${fmtPct(d.pct)} (${fmtInt(d.count)}곳 / 폐업 ${fmtInt(d.closed)}곳)`
      })
    ]
  });
}

const tickYear = (d) => (d % 5 === 0 ? String(d) : "");

// 개요 ④ 연도별 개업(위) · 폐업(아래) — 브랜드 색으로 쌓은 막대 (2005년 이후)
export function yearlyAll(coffee, width) {
  const rows = coffee.yearly.filter((d) => d.year >= 2005);
  return Plot.plot({
    width,
    height: 420,
    marginLeft: 55,
    marginBottom: 35,
    x: {label: null, tickFormat: tickYear},
    y: {grid: true, label: "개업(↑) · 폐업(↓) 매장 수", tickFormat: (d) => fmtInt(Math.abs(d))},
    color: {...brandScale(coffee), legend: true, label: "브랜드"},
    marks: [
      Plot.barY(rows, {x: "year", y: "opened", fill: "brand", tip: true, title: (d) => `${d.year}년 ${d.brand}\n개업 ${fmtInt(d.opened)}곳`}),
      Plot.barY(rows, {x: "year", y: (d) => -d.closed, fill: "brand", fillOpacity: 0.55, tip: true, title: (d) => `${d.year}년 ${d.brand}\n폐업 ${fmtInt(d.closed)}곳`}),
      Plot.ruleY([0])
    ]
  });
}

// 브랜드: 연도별 개업(위, 진한 색) · 폐업(아래, 옅은 색)
export function yearlyBrand(coffee, brand, width) {
  const rows = coffee.yearly.filter((d) => d.brand === brand && d.year >= 2005);
  const color = coffee.colors[brand];
  return Plot.plot({
    width,
    height: 340,
    marginLeft: 55,
    marginBottom: 35,
    x: {label: null, tickFormat: tickYear},
    y: {grid: true, label: "개업(↑) · 폐업(↓) 매장 수", tickFormat: (d) => fmtInt(Math.abs(d))},
    marks: [
      Plot.barY(rows, {x: "year", y: "opened", fill: color, tip: true, title: (d) => `${d.year}년 개업 ${fmtInt(d.opened)}곳`}),
      Plot.barY(rows, {x: "year", y: (d) => -d.closed, fill: color, fillOpacity: 0.45, tip: true, title: (d) => `${d.year}년 폐업 ${fmtInt(d.closed)}곳`}),
      Plot.ruleY([0])
    ]
  });
}

// 브랜드: 시도별 영업 중 매장 수
export function sidoBars(coffee, brand, width) {
  const rows = coffee.regional.filter((d) => d.brand === brand).map((d) => ({sido: sidoShort(d.sido), count: d.count}));
  return Plot.plot({
    width,
    height: rows.length * 22 + 50,
    marginLeft: 50,
    marginRight: 40,
    x: {grid: true, label: "영업 중 매장 수"},
    y: {label: null},
    marks: [
      Plot.barX(rows, {y: "sido", x: "count", fill: coffee.colors[brand], sort: {y: "-x"}, tip: true, title: (d) => `${d.sido} ${fmtInt(d.count)}곳`}),
      Plot.text(rows, {y: "sido", x: "count", text: (d) => fmtInt(d.count), dx: 4, textAnchor: "start"})
    ]
  });
}

// 브랜드: 시군구 TOP 10
export function sigunguTop(coffee, brand, width) {
  const rows = (coffee.top_sigungu_by_brand[brand] ?? []).map((d) => {
    const [sido, ...rest] = d.area.split(" ");
    return {area: `${sidoShort(sido)} ${rest.join(" ")}`, count: d.count};
  });
  return Plot.plot({
    width,
    height: rows.length * 26 + 50,
    marginLeft: 110,
    marginRight: 40,
    x: {grid: true, label: "영업 중 매장 수"},
    y: {label: null},
    marks: [
      Plot.barX(rows, {y: "area", x: "count", fill: coffee.colors[brand], sort: {y: "-x"}, tip: true, title: (d) => `${d.area} ${fmtInt(d.count)}곳`}),
      Plot.text(rows, {y: "area", x: "count", text: (d) => fmtInt(d.count), dx: 4, textAnchor: "start"})
    ]
  });
}

// 브랜드: 폐업 매장 생존기간 분포 (이 브랜드 폐업 매장 100%) + 전체 평균 눈금
export function survivalBrand(coffee, brand, width) {
  const rows = survivalShares(coffee).filter((d) => d.brand === brand);
  return Plot.plot({
    width,
    height: 340,
    marginBottom: 40,
    x: {domain: BUCKETS, label: "개업부터 폐업까지"},
    y: {grid: true, label: "폐업 매장 중 비율 (%)", domain: [0, Math.max(60, ...rows.map((d) => d.pct), ...pooledSurvivalShares(coffee).map((d) => d.pct)) + 5]},
    marks: [
      Plot.barY(rows, {x: "bucket", y: "pct", fill: coffee.colors[brand], tip: true, title: (d) => `${d.bucket}\n${fmtPct(d.pct)} (${fmtInt(d.count)}곳 / 폐업 ${fmtInt(d.closed)}곳)`}),
      Plot.text(rows, {x: "bucket", y: "pct", text: (d) => fmtPct(d.pct), dy: -8}),
      Plot.tickY(pooledSurvivalShares(coffee), {x: "bucket", y: "pct", stroke: "currentColor", strokeWidth: 2, strokeDasharray: "3,2", tip: true, title: (d) => `10개 브랜드 전체 평균\n${d.bucket} ${fmtPct(d.pct)}`}),
      Plot.ruleY([0])
    ]
  });
}

function shareBars(coffee, brand, width, {rows, x, label, baseline}) {
  return Plot.plot({
    width,
    height: 300,
    marginBottom: 40,
    x: {domain: x, label: null},
    y: {grid: true, label},
    marks: [
      Plot.barY(rows, {x: "key", y: "pct", fill: coffee.colors[brand], tip: true, title: (d) => `${d.key} ${fmtPct(d.pct)}`}),
      Plot.ruleY([baseline], {stroke: "currentColor", strokeDasharray: "4,3", strokeOpacity: 0.6}),
      Plot.ruleY([0])
    ]
  });
}

// 브랜드: 개업 요일 분포 (브랜드 내 비중 %) — 균등 분포(1/7) 기준선
export function weekdayBars(coffee, brand, width) {
  const rows = coffee.weekday.filter((d) => d.brand === brand).map((d) => ({key: d.weekday, pct: d.pct}));
  return shareBars(coffee, brand, width, {rows, x: WEEKDAYS, label: "개업 비중 (%)", baseline: 100 / 7});
}

// 브랜드: 개업 월 분포 (브랜드 내 비중 %) — 균등 분포(1/12) 기준선
export function monthBars(coffee, brand, width) {
  const rows = coffee.monthly.filter((d) => d.brand === brand).map((d) => ({key: `${d.month}월`, pct: d.pct}));
  return shareBars(coffee, brand, width, {rows, x: MONTHS, label: "개업 비중 (%)", baseline: 100 / 12});
}

// 브랜드: 가장 가까운 스타벅스까지의 거리 분포 (스타벅스 제외) + 나머지 브랜드 단순 평균 눈금
export function proximityBars(coffee, brand, width) {
  const rows = coffee.proximity.filter((d) => d.brand === brand);
  const others = coffee.brands.filter((b) => b !== "스타벅스" && b !== brand);
  const avg = DIST_BUCKETS.map((bucket) => ({
    bucket,
    pct: others.reduce((s, b) => s + (coffee.proximity.find((d) => d.brand === b && d.bucket === bucket)?.pct ?? 0), 0) / others.length
  }));
  return Plot.plot({
    width,
    height: 340,
    marginBottom: 40,
    x: {domain: DIST_BUCKETS, label: "가장 가까운 스타벅스까지의 거리"},
    y: {grid: true, label: "매장 비율 (%)", domain: [0, Math.max(50, ...rows.map((d) => d.pct), ...avg.map((d) => d.pct)) + 5]},
    marks: [
      Plot.barY(rows, {x: "bucket", y: "pct", fill: coffee.colors[brand], tip: true, title: (d) => `${d.bucket}\n${fmtPct(d.pct)}`}),
      Plot.text(rows, {x: "bucket", y: "pct", text: (d) => fmtPct(d.pct), dy: -8}),
      Plot.tickY(avg, {x: "bucket", y: "pct", stroke: "currentColor", strokeWidth: 2, strokeDasharray: "3,2", tip: true, title: (d) => `다른 ${others.length}개 브랜드 단순 평균\n${d.bucket} ${fmtPct(d.pct)}`}),
      Plot.ruleY([0])
    ]
  });
}
