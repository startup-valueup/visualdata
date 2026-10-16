# 카페 프랜차이즈 대시보드 (us-dams 스타일)

[Observable Framework 공식 예제 us-dams](https://github.com/observablehq/framework/tree/main/examples/us-dams)(ISC License, © 2023-2024 Observable, Inc.)의 구성을 뼈대로 만든 카페 프랜차이즈 10개 브랜드 대시보드입니다. 라이선스 전문은 [NOTICE-us-dams.md](NOTICE-us-dams.md)를 참고하세요.

루트의 ECharts 기반 이식본(v2.x)과는 독립된 별도 버전입니다.

## 실행

```bash
cd dams-style
npm install
npm run dev     # 개발 서버
npm run build   # dist/ 생성
```

- `predev` / `prebuild`가 `scripts/bundle-deck.mjs`를 실행해 deck.gl을 `src/components/vendor/deck.js`로 미리 번들합니다(gitignore 대상).
- 데이터는 루트 프로젝트의 집계 JSON 복사본(`src/data/coffee.json`, `skorea.json`)을 `FileAttachment`로 읽습니다. 원본 CSV·사업장명·주소는 없습니다.

## 구성

```
src/index.md                 전국 개요 (지도, 핵심 숫자, 브랜드×생존기간, 연도별 추이)
src/brands/[brand].md        브랜드별 페이지 (파라미터 라우트, 10개)
src/components/              map.js(deck.gl), plots.js(Observable Plot), stats.js(계산·안내 문장) 등
observablehq.config.js       dynamicPaths 로 브랜드 페이지 경로 생성
```
