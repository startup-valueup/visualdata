// 브랜드 페이지 URL 슬러그. observablehq.config.js(Node)와 페이지(브라우저)가 함께 import 하므로 의존성이 없어야 한다.
// 한글 URL 대신 영문 슬러그를 쓰는 이유: 파일명·링크 인코딩 문제를 피하고 GitHub Pages 에서 안전하게 서빙하기 위해.
export const BRAND_PAGES = [
  {name: "스타벅스", slug: "starbucks"},
  {name: "이디야커피", slug: "ediya"},
  {name: "메가커피", slug: "mega"},
  {name: "컴포즈커피", slug: "compose"},
  {name: "투썸플레이스", slug: "twosome"},
  {name: "빽다방", slug: "paik"},
  {name: "더벤티", slug: "theventi"},
  {name: "공차", slug: "gongcha"},
  {name: "텐퍼센트커피", slug: "tenpercent"},
  {name: "매머드익스프레스", slug: "mammoth"}
];

export const brandBySlug = (slug) => BRAND_PAGES.find((b) => b.slug === slug);
export const slugOf = (name) => BRAND_PAGES.find((b) => b.name === name)?.slug;
