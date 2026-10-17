// 02. 누적 매장 수 성장 곡선 (2005년 이후, 브랜드 10개)
import {mountChart} from "../chart.js";
import {LINE, baseOption, categoryAxisLine, legendStyle, tooltipStyle} from "../theme.js";

export function renderGrowthLine(element, coffee) {
  const {brands, colors} = coffee;
  const years = [...new Set(coffee.cumulative.map((d) => d.year))].sort((a, b) => a - b).filter((y) => y >= 2005);
  const series = brands.map((b) => ({
    name: b,
    type: "line",
    showSymbol: false,
    smooth: 0.2,
    lineStyle: {width: 2.4, color: colors[b]},
    itemStyle: {color: colors[b]},
    data: years.map((y) => {
      const rec = coffee.cumulative.find((d) => d.brand === b && d.year === y);
      return rec ? rec.cumulative_active : 0;
    })
  }));
  mountChart(
    element,
    baseOption(coffee, {
      legend: legendStyle(brands),
      grid: {left: 8, right: 20, top: 42, bottom: 8, containLabel: true},
      xAxis: {type: "category", data: years, axisLine: categoryAxisLine, axisTick: {show: false}},
      yAxis: {type: "value", axisLine: {show: false}, splitLine: {lineStyle: {color: LINE}}},
      tooltip: {trigger: "axis", ...tooltipStyle(12)},
      series
    })
  );
}
