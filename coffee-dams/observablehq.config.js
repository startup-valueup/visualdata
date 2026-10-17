// See https://observablehq.com/framework/config for documentation.
// us-dams 예제(observablehq/framework, examples/us-dams)의 구성을 따른다: theme "wide", 사이드바 사용, pager/toc 끔.
import {BRAND_PAGES} from "./src/components/brands.js";

export default {
  root: "src",
  title: "카페 프랜차이즈 지형도",
  theme: "wide",
  sidebar: true,
  pager: false,
  toc: false,

  // 사이트 홈(/)으로 돌아가는 링크. Framework 는 header 의 상대 링크에서 앱 루트를 넘는 `../` 를 잘라 버리므로,
  // 페이지가 불러온 정적 자산(`…/_observablehq/…`) 주소에서 이 앱의 루트를 찾아 그 한 단계 위(= 홈)로 연결한다.
  // 하위 경로 배포(/<repo>/coffee-dams/)와 페이지 깊이(/brands/<slug>)에 상관없이 동작한다.
  header: () =>
    `<a id="home-link" href="../">← 홈</a><script>(function(){var l=[].map.call(document.querySelectorAll('link[rel=modulepreload]'),function(x){return x.href}).filter(function(h){return h.indexOf('/_observablehq/')>-1})[0];if(l)document.getElementById('home-link').href=new URL('../',l.slice(0,l.indexOf('/_observablehq/')+1)).href}())</script>`,

  // 브랜드 페이지는 파라미터 라우트(src/brands/[brand].md)이며, 생성할 경로를 여기서 나열한다.
  dynamicPaths: BRAND_PAGES.map((b) => `/brands/${b.slug}`),
  pages: [
    {
      name: "브랜드별 요약",
      pages: BRAND_PAGES.map((b) => ({name: b.name, path: `/brands/${b.slug}`}))
    }
  ],

  // Framework 는 <html lang>을 출력하지 않으므로 ko 로 지정한다.
  // 한글 폰트: 본문(serif)은 Noto Serif KR, 그 외(sans-serif)는 Noto Sans KR. 예제의 영문 폰트 모양은 유지한다.
  head: `<script>document.documentElement.lang = "ko";</script>
<meta name="description" content="행정안전부 지방행정 인허가 데이터로 본 국내 10개 커피 프랜차이즈의 출점·폐업·상권 분포">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%E2%98%95%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --serif: "Source Serif 4", "Noto Serif KR", "Iowan Old Style", "Apple Garamond", "Palatino Linotype", "Times New Roman", "Droid Serif", Times, serif;
  --sans-serif: "Noto Sans KR", -apple-system, BlinkMacSystemFont, "avenir next", avenir, helvetica, "helvetica neue", ubuntu, roboto, noto, "segoe ui", arial, sans-serif;
}
.muted-note { color: var(--theme-foreground-muted); font-size: 0.85rem; max-width: none; margin: 0.75rem 0 0; }
</style>`,

  // 푸터: 기존 버전(v1/v2)과 같은 데이터·방법론 문구
  footer: `<p style="max-width: 70ch; line-height: 1.6"><strong>데이터 &amp; 방법론.</strong> 행정안전부 지방행정 인허가 데이터(식품업종 전체)에서 브랜드명을 매칭해 수집한 사업장 목록입니다. 업태가 휴게음식점·일반음식점·제과점영업인 건만 "매장"으로 집계했고, 물류센터·유통 등 명백히 매장이 아닌 항목은 제외했습니다. 자판기/무인카페 항목은 별도 카테고리로 분리했습니다(지도·매장수 집계에는 포함하지 않음). 동일 브랜드·주소로 여러 차례 인허가가 난 경우, 매장 수 집계와 지도에는 가장 최근 건 하나만 남겼고, 개업/폐업/생존기간 분석에는 인허가 이력 전체를 사용했습니다. 인허가 데이터 특성상 실제 폐업/영업 상태 반영에 시차가 있을 수 있습니다.</p>`
};
