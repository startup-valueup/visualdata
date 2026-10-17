// 08. 스타벅스 인근 거리 구간(250m/500m/1km/2km) 비율 누적 막대 (스타벅스 제외 9개 브랜드)
import {mountChart} from "../chart.js";
import {LINE, baseOption, categoryAxisLine, legendStyle, tooltipStyle} from "../theme.js";

export function renderProximity(element, coffee) {
  const brands = coffee.brands.filter((b) => b !== "스타벅스");
  const buckets = ["250m 이내", "250~500m", "500m~1km", "1~2km", "2km 이상"];
  const goldScale = ["#C9A24A", "#A88238", "#8A6A2E", "#6B5124", "#4A3A1D"];
  const series = buckets.map((bk, i) => ({
    name: bk,
    type: "bar",
    stack: "x",
    barWidth: 22,
    itemStyle: {color: goldScale[i]},
    data: brands.map((b) => {
      const r = coffee.proximity.find((d) => d.brand === b && d.bucket === bk);
      return r ? r.pct : 0;
    })
  }));
  mountChart(
    element,
    baseOption(coffee, {
      color: goldScale,
      legend: legendStyle(buckets),
      grid: {left: 8, right: 20, top: 42, bottom: 8, containLabel: true},
      xAxis: {type: "category", data: brands, axisLine: categoryAxisLine, axisTick: {show: false}},
      yAxis: {type: "value", axisLine: {show: false}, splitLine: {lineStyle: {color: LINE}}, axisLabel: {formatter: "{value}%"}, max: 100},
      tooltip: {
        trigger: "axis",
        ...tooltipStyle(12),
        formatter: (ps) => {
          let s = `${ps[0].axisValue}`;
          ps.forEach((p) => {
            s += `<br/>${p.seriesName}: ${p.value}%`;
          });
          return s;
        }
      },
      series
    })
  );
}
