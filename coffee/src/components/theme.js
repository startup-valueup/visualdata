// 레거시(v1) 차트 공통 상수·옵션. 값은 coffee_dashboard.html 의 JS 와 동일하다.
export const FONT = "'Noto Sans KR', sans-serif";
export const FONT_SERIF = "'Noto Serif KR', serif";
export const INK = "#F1E8D9";
export const INK_DIM = "#B7A78D";
export const INK_FAINT = "#6B5D48"; // 차트 축 이름용(CSS 변수 --ink-faint 와 다른 값 — 레거시 그대로)
export const LINE = "#3A2E20";
export const GOLD = "#C9A24A";
export const PANEL_2 = "#241D14";

export function tooltipStyle(fontSize, extra = {}) {
  const textStyle = {color: INK, fontFamily: FONT};
  if (fontSize !== undefined) textStyle.fontSize = fontSize;
  return {backgroundColor: PANEL_2, borderColor: LINE, textStyle, ...extra};
}

export function chartTitle(text, fontSize) {
  return {text, left: 0, top: 0, textStyle: {fontFamily: FONT_SERIF, color: INK, fontSize, fontWeight: 500}};
}

export function legendStyle(data, extra = {}) {
  return {data, top: 0, textStyle: {color: INK_DIM, fontSize: 11.5}, icon: "circle", itemWidth: 8, itemHeight: 8, ...extra};
}

export const categoryAxisLine = {lineStyle: {color: LINE}};

// 레거시 baseOption(extra): 브랜드 색 팔레트 + 축 트리거 툴팁.
export function baseOption(coffee, extra) {
  return Object.assign(
    {
      textStyle: {fontFamily: FONT, color: INK_DIM},
      grid: {left: 8, right: 16, top: 28, bottom: 8, containLabel: true},
      tooltip: {trigger: "axis", ...tooltipStyle(12.5)},
      color: coffee.brands.map((b) => coffee.colors[b])
    },
    extra
  );
}
