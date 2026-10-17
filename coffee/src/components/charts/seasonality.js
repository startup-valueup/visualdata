// 07. 개업 요일·월 분포 꺾은선 2개 (인허가일자 기준, 브랜드 내 비중 %)
import {mountChart} from "../chart.js";
import {LINE, baseOption, categoryAxisLine, chartTitle, tooltipStyle} from "../theme.js";

function lineSeries(coffee, valueFor) {
  return coffee.brands.map((b) => ({
    name: b,
    type: "line",
    showSymbol: false,
    lineStyle: {width: 1.8, color: coffee.colors[b]},
    itemStyle: {color: coffee.colors[b]},
    data: valueFor(b)
  }));
}

export function renderWeekday(element, coffee) {
  const order = ["월", "화", "수", "목", "금", "토", "일"];
  mountChart(
    element,
    baseOption(coffee, {
      title: chartTitle("개업 요일 분포 (브랜드 내 비중 %)", 14),
      grid: {left: 8, right: 16, top: 40, bottom: 8, containLabel: true},
      legend: {show: false},
      xAxis: {type: "category", data: order, axisLine: categoryAxisLine, axisTick: {show: false}},
      yAxis: {type: "value", axisLine: {show: false}, splitLine: {lineStyle: {color: LINE}}, axisLabel: {formatter: "{value}%"}},
      tooltip: {trigger: "axis", ...tooltipStyle(11.5)},
      series: lineSeries(coffee, (b) =>
        order.map((w) => {
          const r = coffee.weekday.find((d) => d.brand === b && d.weekday === w);
          return r ? r.pct : 0;
        })
      )
    })
  );
}

export function renderMonth(element, coffee) {
  mountChart(
    element,
    baseOption(coffee, {
      title: chartTitle("개업 월 분포 (브랜드 내 비중 %)", 14),
      grid: {left: 8, right: 16, top: 40, bottom: 8, containLabel: true},
      legend: {show: false},
      xAxis: {type: "category", data: Array.from({length: 12}, (_, i) => `${i + 1}월`), axisLine: categoryAxisLine, axisTick: {show: false}},
      yAxis: {type: "value", axisLine: {show: false}, splitLine: {lineStyle: {color: LINE}}, axisLabel: {formatter: "{value}%"}},
      tooltip: {trigger: "axis", ...tooltipStyle(11.5)},
      series: lineSeries(coffee, (b) =>
        Array.from({length: 12}, (_, i) => {
          const r = coffee.monthly.find((d) => d.brand === b && d.month === i + 1);
          return r ? r.pct : 0;
        })
      )
    })
  );
}
