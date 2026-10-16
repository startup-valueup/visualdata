// 04. 폐업 매장 생존기간 구간별 비율 (100% 누적 막대, 6구간)
// v2.1: 가로축을 브랜드로, 누적 단위를 6개 구간으로 바꿨다. (v1/v2.0 은 구간별로 10개 브랜드의 비율을 쌓아
// 세로축이 500%까지 나가는 구조였다.) 브랜드는 1년 미만 폐업 비중이 높은 순으로 정렬한다.
import {mountChart} from "../chart.js";
import {fmtInt} from "../format.js";
import {survivalInsight} from "../stats.js";
import {LINE, baseOption, categoryAxisLine, legendStyle, tooltipStyle} from "../theme.js";

// 짧게 끝난 구간일수록 밝은 금색 (08 의 금색 계열과 같은 문법)
const BUCKET_COLORS = ["#E8C872", "#C9A24A", "#A88238", "#8A6A2E", "#6B5124", "#4A3A1D"];

export function renderSurvival(element, coffee) {
  const buckets = [...new Set(coffee.survival_hist.map((d) => d.bucket))];
  const order = [...survivalInsight(coffee).rows].sort((a, b) => b.underPct - a.underPct);
  const brands = order.map((r) => r.brand);
  const closedN = Object.fromEntries(order.map((r) => [r.brand, r.closed]));
  const series = buckets.map((bk, i) => ({
    name: bk,
    type: "bar",
    stack: "pct",
    barWidth: 22,
    itemStyle: {color: BUCKET_COLORS[i]},
    data: brands.map((b) => {
      const r = coffee.survival_hist.find((x) => x.brand === b && x.bucket === bk);
      return r && closedN[b] ? (100 * r.count) / closedN[b] : 0;
    })
  }));
  mountChart(
    element,
    baseOption(coffee, {
      color: BUCKET_COLORS,
      legend: legendStyle(buckets),
      grid: {left: 8, right: 20, top: 42, bottom: 8, containLabel: true},
      // 브랜드 10개 라벨을 빠짐없이 표시 (기본 설정은 겹치면 한 칸씩 건너뛴다). 좁은 화면에서는 기울인다.
      xAxis: {type: "category", data: brands, axisLine: categoryAxisLine, axisTick: {show: false}, axisLabel: {interval: 0, rotate: 0}},
      media: [{query: {maxWidth: 640}, option: {grid: {top: 64}, xAxis: {axisLabel: {rotate: 45}}}}],
      yAxis: {type: "value", max: 100, axisLine: {show: false}, splitLine: {lineStyle: {color: LINE}}, axisLabel: {formatter: "{value}%"}},
      tooltip: {
        trigger: "axis",
        ...tooltipStyle(12),
        formatter: (ps) => {
          let s = `${ps[0].axisValue} · 폐업 ${fmtInt(closedN[ps[0].axisValue])}곳`;
          ps.forEach((p) => {
            s += `<br/>${p.seriesName}: ${p.value.toFixed(1)}%`;
          });
          return s;
        }
      },
      series
    })
  );
}
