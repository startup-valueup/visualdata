// 01. 브랜드별 매장 현황: 현재 영업 매장 수 가로 막대 + 폐업률×중위 생존일수 버블
import {mountChart} from "../chart.js";
import {fmtInt} from "../format.js";
import {INK, INK_DIM, INK_FAINT, LINE, baseOption, chartTitle, tooltipStyle} from "../theme.js";

export function renderActiveBar(element, coffee) {
  const {colors} = coffee;
  const sorted = [...coffee.summary].sort((a, b) => b.active_now - a.active_now);
  mountChart(
    element,
    baseOption(coffee, {
      title: chartTitle("현재 영업 중인 매장 수", 15),
      grid: {left: 8, right: 40, top: 46, bottom: 8, containLabel: true},
      xAxis: {type: "value", axisLine: {show: false}, axisTick: {show: false}, splitLine: {lineStyle: {color: LINE}}},
      yAxis: {type: "category", data: sorted.map((d) => d.brand).reverse(), axisLine: {lineStyle: {color: LINE}}, axisTick: {show: false}},
      tooltip: {trigger: "item", ...tooltipStyle(), formatter: (p) => `${p.name}<br/>현재 매장: <b>${fmtInt(p.value)}</b>곳`},
      series: [
        {
          type: "bar",
          data: sorted.map((d) => ({value: d.active_now, itemStyle: {color: colors[d.brand]}})).reverse(),
          barWidth: 16,
          label: {show: true, position: "right", color: INK, fontSize: 12, formatter: (p) => fmtInt(p.value)}
        }
      ]
    })
  );
}

export function renderClosureBubble(element, coffee) {
  const {colors} = coffee;
  const data = coffee.summary.map((d) => ({
    name: d.brand,
    value: [d.closure_rate_pct, d.median_survival_days || 0, d.active_now]
  }));
  const maxActive = Math.max(...data.map((d) => d.value[2]));
  mountChart(
    element,
    baseOption(coffee, {
      title: chartTitle("폐업률 vs 생존 기간", 15),
      // v2.1: 축 이름을 축 중앙으로 옮겨 제목과 겹치거나 오른쪽에서 잘리지 않게 한다.
      grid: {left: 30, right: 24, top: 46, bottom: 30, containLabel: true},
      xAxis: {type: "value", name: "폐업률(%)", nameLocation: "middle", nameGap: 30, nameTextStyle: {color: INK_FAINT}, axisLine: {lineStyle: {color: LINE}}, splitLine: {lineStyle: {color: LINE}}},
      yAxis: {type: "value", name: "중위 생존일수", nameLocation: "middle", nameGap: 52, nameTextStyle: {color: INK_FAINT}, axisLine: {lineStyle: {color: LINE}}, splitLine: {lineStyle: {color: LINE}}},
      tooltip: {
        trigger: "item",
        ...tooltipStyle(),
        formatter: (p) =>
          `<b>${p.name}</b><br/>폐업률 ${p.value[0]}%<br/>중위 생존기간 ${fmtInt(Math.round(p.value[1]))}일<br/>현재 매장 ${fmtInt(p.value[2])}곳`
      },
      series: [
        {
          type: "scatter",
          data,
          symbolSize: (v) => 18 + 42 * Math.sqrt(v[2] / maxActive),
          itemStyle: {color: (p) => colors[p.name], opacity: 0.85, borderColor: "#00000040"},
          label: {show: true, formatter: (p) => p.name, position: "top", color: INK_DIM, fontSize: 11}
        }
      ]
    })
  );
}
