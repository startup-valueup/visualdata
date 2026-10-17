import {BRAND_PAGES} from "./brands.js";
import {fmtInt} from "./format.js";

// 개요 페이지의 브랜드 페이지 링크 목록 (영업 중 매장 수 순). htl 없이 DOM 으로 만든다.
export function brandLinks(coffee) {
  const active = Object.fromEntries(coffee.summary.map((d) => [d.brand, d.active_now]));
  const ul = document.createElement("ul");
  ul.style.cssText = "list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem;";
  for (const b of [...BRAND_PAGES].sort((x, y) => active[y.name] - active[x.name])) {
    const li = document.createElement("li");
    li.style.cssText = "display: flex; align-items: center; gap: 0.5rem;";
    const dot = document.createElement("span");
    dot.style.cssText = `width: 10px; height: 10px; border-radius: 50%; flex: none; background: ${coffee.colors[b.name]};`;
    const a = document.createElement("a");
    a.href = `./brands/${b.slug}`;
    a.textContent = b.name;
    const n = document.createElement("span");
    n.style.cssText = "margin-left: auto; color: var(--theme-foreground-muted); font-variant-numeric: tabular-nums;";
    n.textContent = `${fmtInt(active[b.name])}곳`;
    li.append(dot, a, n);
    ul.append(li);
  }
  return ul;
}
