# 카페 프랜차이즈 지형도: 전국 개요

## 행정안전부 지방행정 인허가 데이터 기반 · 전국 10개 주요 커피 브랜드

```js
import {fmtInt} from "./components/format.js";
import {heroStats, mapCoverageNote, survivalDescription, survivalExcluded} from "./components/stats.js";
import {mountMap} from "./components/map.js";
import {brandLegend, survivalMatrix, survivalShareBars, yearlyAll} from "./components/plots.js";
import {brandLinks} from "./components/nav.js";

// 집계 JSON(레거시 v1 HTML 에서 추출) — 원본 CSV 는 이 저장소에 없다.
const coffee = FileAttachment("data/coffee.json").json();
const geo = FileAttachment("data/skorea.json").json();
```

```js
const hero = heroStats(coffee);
const excluded = survivalExcluded(coffee);
```

전국 10개 주요 커피 브랜드의 인허가 이력 ${fmtInt(hero.episodes)}건(${hero.minYear}–${hero.maxYear})을 정제해, 출점 속도와 폐업, 상권 분포를 살펴봅니다. 브랜드별 상세는 왼쪽 목록이나 아래 카드에서 열 수 있습니다.

<div class="grid grid-cols-4">
  <div class="card">
    <h2>현재 영업 중인 매장</h2>
    <span class="big">${fmtInt(hero.active)}</span>
  </div>
  <div class="card">
    <h2>누적 폐업 매장</h2>
    <span class="big">${fmtInt(hero.closed)}</span>
  </div>
  <div class="card">
    <h2>분석 대상 브랜드</h2>
    <span class="big">${hero.brandCount}</span>
  </div>
  <div class="card">
    <h2>자판기 · 무인카페 (별도 집계)</h2>
    <span class="big">${fmtInt(hero.vending)}</span>
  </div>
</div>

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2" style="padding: 0px;">
    <div style="padding: 1rem;">
      <h2>전국 매장 위치</h2>
      <h3>휠로 확대하고 드래그로 이동할 수 있습니다. 점 하나가 영업 중인 매장 1곳이며, 색은 브랜드입니다.</h3>
      ${brandLegend(coffee)}
    </div>
    <figure style="max-width: none; position: relative; margin: 0;">
      <div id="map-all" style="border-radius: 8px; overflow: hidden; height: 620px; position: relative;"></div>
    </figure>
    <div style="padding: 0 1rem 1rem;">
      <p class="muted-note"><strong>읽는 법.</strong> 점이 몰린 곳이 매장 밀집 지역입니다. 지도는 점 위치만 보여 주며, 같은 건물의 여러 매장은 겹쳐 보일 수 있습니다.</p>
      <p class="muted-note"><strong>데이터 한계.</strong> ${mapCoverageNote(coffee)}</p>
    </div>
  </div>
  <div class="card grid-colspan-1">
    <h2>브랜드별 페이지</h2>
    <h3>영업 중 매장 수 순 · 클릭하면 브랜드 상세로 이동합니다</h3>
    ${brandLinks(coffee)}
  </div>
</div>

```js
const deckAll = mountMap(document.getElementById("map-all"), {coffee, geo});
invalidation.then(() => {
  deckAll.finalize();
  document.getElementById("map-all").innerHTML = "";
});
```

<div class="card" style="max-width: none; font-size: 1.1rem">
  <h2>폐업 매장의 생존 기간</h2>
  ${survivalDescription(coffee)}
</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h2>브랜드 × 생존기간 구간</h2>
    <h3>원 크기는 해당 구간에 폐업한 매장 수</h3>
    ${resize((width) => survivalMatrix(coffee, width))}
    <p class="muted-note"><strong>읽는 법.</strong> 원이 클수록 그 구간에 폐업한 매장이 많다는 뜻입니다. 크기는 건수라 폐업이 많은 브랜드가 크게 보이므로, 브랜드끼리의 비교는 오른쪽 비율 막대로 하세요.</p>
  </div>
  <div class="card">
    <h2>브랜드별 생존기간 분포</h2>
    <h3>각 브랜드의 폐업 매장을 100%로 본 비율</h3>
    ${resize((width) => survivalShareBars(coffee, width))}
    <p class="muted-note"><strong>읽는 법.</strong> 막대 하나가 한 브랜드의 폐업 매장 전체(100%)이고, 왼쪽의 주황 구간일수록 일찍 문을 닫은 매장입니다. 위쪽 브랜드일수록 1년 미만 폐업 비중이 높습니다. 개업·폐업일을 알 수 없거나 기간이 0일 이하인 폐업 ${fmtInt(excluded)}건은 제외했습니다.</p>
  </div>
</div>

<div class="card">
  <h2>연도별 개업 · 폐업 추이</h2>
  <h3>2005년 이후, 색은 브랜드 · 0선 위가 개업, 아래가 폐업</h3>
  ${resize((width) => yearlyAll(coffee, width))}
  <p class="muted-note"><strong>읽는 법.</strong> 막대 높이가 그해 개업(위)과 폐업(아래) 매장 수의 합이고, 색 조각이 브랜드입니다. 마지막 연도(${hero.maxYear}년)는 한 해가 모두 채워지지 않은 중간 집계일 수 있고, 인허가 데이터는 폐업 반영에 시차가 있을 수 있습니다.</p>
</div>
