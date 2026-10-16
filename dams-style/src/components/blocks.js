import {proximityBars} from "./plots.js";

function el(tag, text, style) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (style) node.style.cssText = style;
  return node;
}

// 스타벅스 인근 거리 블록: 스타벅스는 기준 브랜드라 안내만 보여 주고, 나머지 9개 브랜드는 차트 + 읽는 법을 보여 준다.
// (htl 의 html 템플릿 대신 DOM 으로 만들어 외부 CDN 의존을 피한다.)
export function proximityBlock(coffee, brand, width) {
  const box = document.createElement("div");
  if (brand === "스타벅스") {
    box.append(el("p", "스타벅스는 거리의 기준 브랜드라서 이 분포를 계산하지 않습니다. 다른 9개 브랜드 페이지에서 확인할 수 있습니다."));
    return box;
  }
  const note = el("p", "", "");
  note.className = "muted-note";
  const strong = el("strong", "읽는 법.");
  note.append(strong, document.createTextNode(" 왼쪽 구간(250m 이내)이 높을수록 스타벅스 가까이에 있는 매장이 많다는 뜻입니다. 좌표가 있는 영업 중 매장끼리의 직선거리이며, 같은 상권에 자연스럽게 몰린 결과인지 스타벅스를 따라 입점한 결과인지는 이 데이터만으로 구분할 수 없습니다."));
  box.append(el("h3", `${brand} 매장의 거리 구간 비율 · 점선은 나머지 브랜드 단순 평균`), proximityBars(coffee, brand, width), note);
  return box;
}
