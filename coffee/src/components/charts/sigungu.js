// 06. 시군구 합산 TOP 15 막대 + 브랜드 탭별 TOP 순위표
import {mountChart} from "../chart.js";
import {mountTabs} from "../controls.js";
import {fmtInt} from "../format.js";
import {GOLD, INK, LINE, baseOption, chartTitle, tooltipStyle} from "../theme.js";

export function renderSigunguTop(element, coffee) {
  const top = [...coffee.top_sigungu_overall].sort((a, b) => a.count - b.count).slice(-15);
  mountChart(
    element,
    baseOption(coffee, {
      title: chartTitle("전체 브랜드 합산 TOP 15 상권", 14),
      grid: {left: 8, right: 30, top: 40, bottom: 8, containLabel: true},
      xAxis: {type: "value", axisLine: {show: false}, splitLine: {lineStyle: {color: LINE}}},
      yAxis: {type: "category", data: top.map((d) => d.area), axisLine: {lineStyle: {color: LINE}}, axisTick: {show: false}, axisLabel: {fontSize: 11.5}},
      tooltip: {trigger: "item", ...tooltipStyle(), formatter: (p) => `${p.name}<br/>합산 매장 수: <b>${fmtInt(p.value)}</b>곳`},
      series: [
        {
          type: "bar",
          data: top.map((d) => d.count),
          itemStyle: {color: GOLD},
          barWidth: 12,
          label: {show: true, position: "right", color: INK, fontSize: 11, formatter: (p) => fmtInt(p.value)}
        }
      ]
    })
  );
}

export function renderSigunguTable(tabsId, tbodyEl, coffee) {
  mountTabs(tabsId, coffee.brands, (brand) => {
    const rows = coffee.top_sigungu_by_brand[brand] || [];
    tbodyEl.replaceChildren(
      ...rows.map((r) => {
        const tr = document.createElement("tr");
        const area = document.createElement("td");
        area.textContent = r.area;
        const count = document.createElement("td");
        count.className = "num";
        count.textContent = fmtInt(r.count);
        tr.append(area, count);
        return tr;
      })
    );
  });
}
