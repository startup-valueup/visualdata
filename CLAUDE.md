# CLAUDE.md

한국 데이터 대시보드·지도 시각화를 모아 두는 Observable Framework 프로젝트. 응답과 UI 문구는 **한국어**로 쓴다.

## 버전 표기

- **v1** = 레거시 단일 HTML 대시보드 (`legacy/coffee_dashboard.html`, `legacy/*.ipynb`).
- **v2** = Framework 이식본 (`src/`). `package.json`의 `version`과 보고서에서 같은 체계로 표기한다.
- 이후 작은 수정은 **v2.1, v2.2 …** 처럼 버전을 올려 표기한다 (큰 구조 변경은 v3).
- **v2.1**: 04 생존기간 차트를 100% 누적(가로축=브랜드, 누적=6구간)으로 수정, 01 버블 차트 축 이름 겹침·잘림 수정.

## 명령어

```bash
npm install
npm run dev      # 개발 서버 (http://127.0.0.1:3000)
npm run build    # dist/ 생성 — 작업 후 반드시 성공 확인
```

- 텔레메트리를 끄려면 `OBSERVABLE_TELEMETRY_DISABLE=true`.
- 배포 워크플로(GitHub Pages)는 아직 없다. 하위 경로 배포에 `base`는 필요 없다(`observablehq.config.js` 주석 참고).
- `npm:` import는 빌드·개발 시 jsDelivr에서 받아 `src/.observablehq/cache/`에 캐시한다. jsDelivr가 막힌 환경(일부 샌드박스)에서는
  `node_modules/echarts/dist/echarts.esm.min.js`를 `src/.observablehq/cache/_npm/echarts@5.5.0/dist/echarts.esm.min.js._esm.js`로
  복사하면 오프라인으로 빌드된다 (캐시는 gitignore 대상).

## 폴더 구조

```
observablehq.config.js     # 단일 페이지: sidebar/toc/pager/header/footer 끔, style.css, Google Fonts head
src/index.md               # 커피 프랜차이즈 대시보드 (섹션 01~08)
src/style.css              # 레거시 CSS 이식본 (Framework 기본 CSS는 import 하지 않음)
src/components/            # chart.js(마운트/ECharts), theme.js(공통 옵션), stats.js(계산·안내 문장), controls.js, hero.js
src/components/charts/     # 섹션별 차트 모듈 (stores, growth, entry-exit, survival, map, sigungu, seasonality, proximity)
src/data/                  # coffee.json(집계), skorea.json(시도 GeoJSON) — 정적 JSON, FileAttachment로 읽음
data-raw/                  # 원본 CSV (gitignore, 저장소에 없음)
legacy/                    # v1 원본 (gitignore)
```

## 작업 규칙

- **폰트**: 제목·큰 숫자는 Noto Serif KR, 본문은 Noto Sans KR (`observablehq.config.js`의 `head`에서 Google Fonts 로드).
- **데이터 한계 + 차트 해석 안내**: 새 대시보드·새 차트에는 "데이터의 한계"와 "차트 읽는 법"을 설명하는 문장을 기본으로 넣는다.
  수치가 들어가는 문장은 하드코딩하지 말고 데이터에서 계산한다 (`src/components/stats.js`). 데이터가 가설과 맞지 않으면 문장을 맞추지 말고 그대로 쓴다.
- **커밋 금지 데이터**: 원본 CSV, 사업장명, 주소는 **절대 커밋하지 않는다.** `src/data/`에는 집계 JSON과
  (브랜드 + 좌표만 가진) 점 데이터만 둔다. 새 데이터를 추가할 때 컬럼에 상호·주소가 섞이지 않았는지 먼저 확인한다.
- **분석 코드**는 `.py`가 아니라 **주피터 노트북(.ipynb)** 으로 작성한다. 여러 결과표를 내보낼 때는 CSV 여러 개가 아니라
  **시트별로 나눈 엑셀 파일 하나**로 저장한다.
- 데이터는 로더를 만들지 않고 정적 JSON을 `FileAttachment`로 읽는다 (GitHub Actions가 원본 없이 빌드되게 하기 위함).
- 지도는 ECharts `registerMap` 기반을 유지한다. 타일 지도·Deck.gl·연도 슬라이더는 범위 밖.
- 레거시와 달라지는 값·문구·동작은 숨기지 말고 보고한다.

## Git

- **커밋은 사용자가 요청할 때만** 한다. 푸시·PR도 요청 시에만.
- 작업을 마치면 **변경 요약, 실행 방법, 레거시(v1)와 달라진 점**을 보고한다 (결정이 필요한 질문은 최대 5개).
