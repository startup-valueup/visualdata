import {byId} from "./chart.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// 히어로 통계 5칸 (.stat-row)
export function renderStatRow(containerId, stats) {
  byId(containerId).replaceChildren(
    ...stats.map((s) => {
      const stat = el("div", "stat");
      stat.append(el("span", "num", String(s.num)), el("span", "lbl", s.lbl));
      return stat;
    })
  );
}

// 브랜드 범례 (.legend-swatches)
export function renderBrandLegend(containerId, coffee) {
  byId(containerId).replaceChildren(
    ...coffee.brands.map((brand) => {
      const sw = el("span", "sw");
      const dot = el("span", "dot");
      dot.style.background = coffee.colors[brand];
      sw.append(dot, document.createTextNode(brand));
      return sw;
    })
  );
}
