export const fmtInt = (n) => Number(n).toLocaleString("ko-KR");
export const fmtPct = (n, digits = 1) => `${Number(n).toFixed(digits)}%`;

// "#RRGGBB" -> [r, g, b] (deck.gl 색상)
export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// 시도 전체 이름 -> 짧은 이름 (지도 라벨·막대 차트용)
const SIDO_SHORT = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주"
};
export const sidoShort = (name) => SIDO_SHORT[name] ?? name;
