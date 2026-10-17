# CLAUDE.md

소상공인·인허가를 포함한 한국 공간데이터 시각화 모음 사이트(Observable Framework). 응답과 UI 문구는 **한국어**로 쓴다.

## 프로젝트 구조

독립된 Framework 프로젝트 세 개와 도구 하나로 이루어진다. **npm workspaces를 쓰지 않는다**(각자 `package.json`/lock 유지 — coffee-dams의 deck.gl 사전 번들 스크립트와 충돌 위험).

| 폴더 | 역할 | 배포 경로 |
|---|---|---|
| `home/` | **홈** — 대시보드 카드 목록. 제목·소개·푸터는 `src/data/site.json`, 카드는 `src/data/dashboards.json` | `/` |
| `coffee/` | **v2 ECharts 이식본** — 레거시 단일 HTML(v1)을 옮긴 카페 프랜차이즈 대시보드 (갈색 다크 테마) | `/coffee/` |
| `coffee-dams/` | **us-dams 스타일** — Observable 공식 예제 us-dams 구성의 같은 카페 데이터 (deck.gl 지도 + Observable Plot, 브랜드별 파라미터 라우트 10개) | `/coffee-dams/` |
| `tools/` | 사이트 도구 — `_site` 합치기, 썸네일 자동 캡처 (Playwright). 대시보드 프로젝트에는 넣지 않는다 | (배포 안 함) |
| `legacy/` | v1 원본 (gitignore, 원격에는 이미 커밋되어 있음) | — |

```
.github/workflows/deploy.yml   # home, coffee, coffee-dams 를 각각 빌드해 합쳐 한 번에 Pages 배포
home/  coffee/  coffee-dams/  tools/
```

## 버전 표기

- **v1** = 레거시 단일 HTML 대시보드 (`legacy/coffee_dashboard.html`).
- **v2.x** = `coffee/` (ECharts 이식본). `coffee/package.json`의 `version`과 보고서에서 같은 체계로 표기한다. 작은 수정은 v2.1, v2.2 … (큰 구조 변경은 v3).
  - v2.1: 04 생존기간 차트 100% 누적으로 수정, 01 버블 차트 축 이름 겹침·잘림 수정.
- `coffee-dams/`와 `home/`은 별도 버전 체계(각 `package.json`).

## 명령어 (프로젝트 폴더에서 각각)

```bash
cd coffee        # 또는 home, coffee-dams
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 생성 — 작업 후 반드시 성공 확인
```

- 텔레메트리를 끄려면 `OBSERVABLE_TELEMETRY_DISABLE=true`.
- `coffee-dams`는 `predev`/`prebuild`로 `scripts/bundle-deck.mjs`가 deck.gl을 `src/components/vendor/deck.js`로 미리 번들한다(gitignore 대상). Framework의 node import 번들러가 deck.gl을 처리하지 못하기 때문이다.
- `coffee`의 `npm:echarts`는 빌드·개발 시 jsDelivr에서 받아 `src/.observablehq/cache/`에 캐시한다. jsDelivr가 막힌 환경(일부 샌드박스)에서는
  `coffee/node_modules`에 echarts를 설치한 뒤 `echarts/dist/echarts.esm.min.js`를
  `coffee/src/.observablehq/cache/_npm/echarts@5.5.0/dist/echarts.esm.min.js._esm.js`로 복사하면 오프라인으로 빌드된다(캐시는 gitignore 대상).
- 하위 경로 배포(`/<repo>/…`)에 `base` 설정은 필요 없다 — Framework `base`는 404 페이지에만 쓰이고 나머지는 상대 경로다.

## 홈 화면과 대시보드 추가

- 카드는 `home/src/data/dashboards.json`이 원천이다. 핵심 숫자·기간은 `dashboard-cards.json.js`(Node 데이터 로더)가 빌드 시 각 프로젝트의 집계 JSON에서 계산한다. **숫자를 하드코딩하지 않는다.**
- 새 대시보드를 추가하는 순서:
  1. 새 Framework 프로젝트 폴더를 만들고(자체 `package.json`/lock) 상단에 상대 경로 `← 홈` 링크를 둔다.
  2. `home/src/data/dashboards.json`에 항목 추가(경로, 제목, 설명, 태그, 출처, 숫자를 읽을 데이터 파일).
  3. `tools/thumbs.config.json`에 캡처 항목 추가, `tools/compose-site.mjs`의 `PROJECTS`와 `.github/workflows/deploy.yml`에 프로젝트 추가.
  4. `cd tools && npm run thumbs`로 썸네일을 만들어 **커밋**한다(배포 워크플로는 캡처하지 않는다).
- 검색·필터는 아직 없다. 태그는 표시만 한다.

## 작업 규칙

- **폰트**: 한글은 Noto Sans KR(제목·큰 숫자가 있는 대시보드는 Noto Serif KR 병용). 각 프로젝트의 `observablehq.config.js` `head`에서 Google Fonts를 로드한다.
- **데이터 한계 + 차트 해석 안내**: 새 대시보드·새 차트에는 "데이터의 한계"와 "차트 읽는 법"을 설명하는 문장을 기본으로 넣는다.
  수치가 들어가는 문장은 하드코딩하지 말고 데이터에서 계산한다. 데이터가 가설과 맞지 않으면 문장을 맞추지 말고 그대로 쓴다.
- **커밋 금지 데이터**: 원본 CSV, 사업장명, 주소는 **절대 커밋하지 않는다.** 각 프로젝트의 `src/data/`에는 집계 JSON과
  (브랜드 + 좌표만 가진) 점 데이터만 둔다. 새 데이터를 추가할 때 컬럼에 상호·주소가 섞이지 않았는지 먼저 확인한다.
- **분석 코드**는 `.py`가 아니라 **주피터 노트북(.ipynb)** 으로 작성한다. 여러 결과표를 내보낼 때는 CSV 여러 개가 아니라
  **시트별로 나눈 엑셀 파일 하나**로 저장한다.
- 데이터는 로더 없이 정적 JSON을 `FileAttachment`로 읽는다(GitHub Actions가 원본 없이 빌드되게 하기 위함). 예외: 홈의 카드 로더는 이미 커밋된 집계 JSON만 읽는다.
- 대시보드 프로젝트의 집계 JSON은 프로젝트마다 복사본을 가진다(`coffee/src/data`, `coffee-dams/src/data`). 갱신하면 둘 다 맞춘다.
- 지도는 `coffee`가 ECharts `registerMap`, `coffee-dams`가 deck.gl(타일 없이 `skorea.json` 경계)이다. 타일 지도·연도 슬라이더는 범위 밖.
- 레거시와 달라지는 값·문구·동작은 숨기지 말고 보고한다.

## Git

- **커밋은 사용자가 요청할 때만** 한다. 푸시·PR·병합도 요청 시에만.
- 작업을 마치면 **변경 요약, 실행 방법, 레거시(v1)와 달라진 점**을 보고한다 (결정이 필요한 질문은 최대 5개).
