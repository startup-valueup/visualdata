# 카페 프랜차이즈 대시보드 — ECharts 이식본 (v2.x)

레거시 단일 HTML 대시보드(v1)를 Observable Framework + ECharts로 옮긴 버전입니다.

> **경로 변경:** 배포 주소가 기존 `/`에서 `/coffee/`로 바뀌었습니다. 사이트 루트(`/`)는 대시보드 목록을 보여 주는 홈(`home/`)이 차지합니다.

## 실행

```bash
cd coffee
npm install
npm run dev     # 개발 서버
npm run build   # dist/ 생성
```

- 데이터는 `src/data/`의 집계 JSON(`coffee.json`, `skorea.json`)을 `FileAttachment`로 읽습니다. 원본 CSV·사업장명·주소는 없습니다.
- ECharts는 `npm:echarts@5.5.0`으로 빌드 시 jsDelivr에서 받습니다(자세한 우회 방법은 루트 `CLAUDE.md`).
