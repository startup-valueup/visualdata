// See https://observablehq.com/framework/config for documentation.
// 사이트 홈(/). 제목·소개·푸터 문구는 src/data/site.json 한 곳에서만 바꾼다.
import {readFileSync} from "node:fs";

const site = JSON.parse(readFileSync(new URL("./src/data/site.json", import.meta.url), "utf-8"));
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default {
  root: "src",
  title: site.title,

  // 중립적인 밝은 테마("air") + 넓은 본문("wide", 기본 640px 폭 제한 해제). 강조색은 테마의 focus 색(파란색) 하나만 쓴다.
  theme: ["air", "wide"],
  sidebar: false,
  pager: false,
  toc: false,
  globalStylesheets: [], // 기본 Source Serif 4 요청 제거 — 한글은 아래 Noto Sans KR 을 쓴다.

  // Framework 는 <html lang>을 출력하지 않으므로 ko 로 지정한다.
  head: `<script>document.documentElement.lang = "ko";</script>
<meta name="description" content="${escape(site.description)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%97%BA%EF%B8%8F%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --serif: "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --sans-serif: "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
</style>`,

  footer: `<div class="site-footer"><strong>데이터 출처와 한계</strong><ul>${site.footerNotes.map((n) => `<li>${escape(n)}</li>`).join("")}</ul></div>`

  // GitHub Pages 하위 경로 배포: Framework 의 base 옵션은 /404 페이지에만 쓰이고 나머지는 상대 경로라 설정이 필요 없다.
  // 대시보드 링크도 상대 경로(./coffee/ 등)라 어느 하위 경로에서도 동작한다.
};
