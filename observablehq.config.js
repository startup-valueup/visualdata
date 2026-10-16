// See https://observablehq.com/framework/config for documentation.
export default {
  // 페이지 제목은 src/index.md 의 front matter(title)를 그대로 사용한다.
  root: "src",
  output: "dist",

  // 단일 대시보드 페이지: 레거시(v1) 디자인 그대로 보여주기 위해 Framework 기본 UI는 모두 끈다.
  sidebar: false,
  toc: false,
  pager: false,
  header: "",
  footer: "", // 기본값 "Built with Observable." 제거

  // 레거시 <style> 이식본. Framework 기본 CSS(default.css)는 import 하지 않는다 —
  // 기본 본문 폭(1440px)/serif 폰트/표 스타일이 레거시 디자인과 충돌하기 때문.
  style: "style.css",
  globalStylesheets: [], // 기본값(Source Serif 4 Google Fonts 요청)을 쓰지 않는다. 폰트는 아래 head 에서 로드.

  // Framework 는 <html lang>을 출력하지 않으므로 여기서 ko 로 지정한다.
  // 폰트는 레거시와 동일하게 Google Fonts(Noto Serif KR / Noto Sans KR)를 사용.
  head: `<script>document.documentElement.lang = "ko";</script>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%E2%98%95%3C/text%3E%3C/svg%3E">
<meta name="description" content="행정안전부 지방행정 인허가 데이터로 본 국내 10개 커피 프랜차이즈의 출점·폐업·상권 분포">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">`

  // GitHub Pages 하위 경로(https://<user>.github.io/<repo>/) 배포 메모:
  // Framework 의 `base` 옵션은 현재 /404 페이지의 <base href> 에만 쓰이고, 나머지 페이지/에셋은
  // 모두 상대 경로로 출력된다(문서 + dist 코드 확인). 따라서 이 프로젝트(404 페이지 없음)는
  // base 를 설정할 필요가 없다. 404.md 를 추가하게 되면 그때 `base: "/<repo>/"` 를 지정할 것.
};
