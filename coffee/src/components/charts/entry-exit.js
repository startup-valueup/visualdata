// 03. 연도별 개업(+)/폐업(−) 스택 막대, 브랜드 탭 전환
import {mountChart} from "../chart.js";
import {mountTabs} from "../controls.js";
import {fmtInt} from "../format.js";
import {FONT, INK_DIM, LINE, categoryAxisLine, legendStyle, tooltipStyle} from "../theme.js";

export function renderEntryExit(element, tabsId, coffee) {
  let chart;
  function option(brand) {
    const rows = coffee.yearly.filter((d) => d.brand === brand && d.year >= 2005).sort((a, b) => a.year - b.year);
    return {
      textStyle: {fontFamily: FONT},
      color: [coffee.colors[brand], "#7A6A50"],
      legend: legendStyle(["개업", "폐업"], {textStyle: {color: INK_DIM}}),
      grid: {left: 8, right: 20, top: 40, bottom: 8, containLabel: true},
      tooltip: {
        trigger: "axis",
        ...tooltipStyle(12),
        formatter: (ps) => {
          let s = `${ps[0].axisValue}년`;
          ps.forEach((p) => {
            s += `<br/>${p.seriesName}: ${fmtInt(Math.abs(p.value))}곳`;
          });
          return s;
        }
      },
      xAxis: {type: "category", data: rows.map((r) => r.year), axisLine: categoryAxisLine, axisTick: {show: false}},
      yAxis: {type: "value", axisLine: {show: false}, splitLine: {lineStyle: {color: LINE}}, axisLabel: {formatter: (v) => fmtInt(Math.abs(v))}},
      series: [
        {name: "개업", type: "bar", stack: "x", data: rows.map((r) => r.opened)},
        {name: "폐업", type: "bar", stack: "x", data: rows.map((r) => -r.closed)}
      ]
    };
  }
  mountTabs(tabsId, coffee.brands, (brand) => {
    if (chart) chart.setOption(option(brand), true);
    else chart = mountChart(element, option(brand), {notMerge: true});
  });
}
