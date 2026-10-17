# tools — 사이트 도구

세 프로젝트(`home/`, `coffee/`, `coffee-dams/`)를 배포 구조로 합치고, 홈 화면의 대시보드 썸네일을 자동으로 캡처합니다.
대시보드 프로젝트에는 의존하지 않는 독립 프로젝트입니다(자체 `package.json`/lock).

## 준비

```bash
cd tools
npm install
npx playwright install chromium   # 브라우저가 없을 때 (이 저장소의 클라우드 세션에는 미리 설치되어 있음)
```

세 대시보드 프로젝트도 각자 `npm install`이 되어 있어야 합니다.

## 썸네일 다시 만들기

```bash
cd tools
npm run thumbs                      # 세 프로젝트 빌드 → ../_site 합치기 → 서버 → 캡처 → ../home/src/thumbs/*.webp
npm run thumbs -- --no-build        # 이미 합친 ../_site 로 캡처만
npm run thumbs -- --only coffee-dams
npm run thumbs -- --fontsource      # 구글 폰트 대신 @fontsource 글꼴을 강제로 사용
```

- 결과 이미지는 `home/src/thumbs/`에 저장되고 **커밋해서 사용**합니다. 배포 워크플로는 캡처를 하지 않습니다.
- 지도·차트가 비어 있으면(색이 거의 없으면) 저장하지 않고 실패합니다.
- 한글 글꼴: 시작할 때 Google Fonts가 실제로 적용되는지 확인하고, 안 되면 `fonts.googleapis.com` 요청을 가로채 `@fontsource`의 같은 이름 글꼴로 대신 응답합니다.
- deck.gl(WebGL) 지도는 소프트웨어 렌더링 플래그(`--use-angle=swiftshader`)로 그립니다.

## 새 대시보드의 썸네일 추가

1. `thumbs.config.json`의 `items`에 항목 추가: `id`, `url`(합친 사이트 기준 경로), `selector`(캡처할 영역), `waitFor`(그려진 뒤에 나타나는 요소), `file`(파일명).
   필요하면 `maxHeight`(위쪽만 자르기), `prepare`(예: 지도 휠 확대), `settleMs`(추가 대기)를 지정합니다.
2. `home/src/data/dashboards.json`의 해당 항목 `thumbnail`에 같은 파일명을 적습니다.
3. 새 프로젝트면 `compose-site.mjs`의 `PROJECTS`에도 한 줄 추가합니다.

## 로컬 서버

```bash
npm run serve -- ../_site --prefix /visualdata/ --port 4300   # GitHub Pages 하위 경로 배포와 같은 조건으로 확인
```
