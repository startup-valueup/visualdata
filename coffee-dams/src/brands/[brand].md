---
title: 브랜드별 요약
---

# ${name}

## 전국 영업 현황 · 지방행정 인허가 데이터 기준

```js
import {brandBySlug} from "../components/brands.js";
import {fmtInt, fmtPct} from "../components/format.js";
import {brandSummary, brandSurvivalNote, mapCoverageNote} from "../components/stats.js";
import {mountMap} from "../components/map.js";
import {proximityBlock} from "../components/blocks.js";
import {monthBars, sidoBars, sigunguTop, survivalBrand, weekdayBars, yearlyBrand} from "../components/plots.js";

// 파라미터 라우트: /brands/<slug> — slug 는 observablehq.config.js 의 dynamicPaths 에서 온다.
const name = brandBySlug(observable.params.brand).name;
const isStarbucks = name === "스타벅스";
// 정적 HTML 의 <title> 은 모든 브랜드 페이지에서 같으므로(front matter 는 파라미터를 쓸 수 없음) 브라우저에서 브랜드명을 붙인다.
document.title = `${name} | 카페 프랜차이즈 지형도`;

const coffee = FileAttachment("../data/coffee.json").json();
const geo = FileAttachment("../data/skorea.json").json();
```

```js
const s = brandSummary(coffee, name);
const years = (s.medianSurvivalDays / 365).toFixed(1);
```

[← 전국 개요로](../)

<div class="grid grid-cols-4">
  <div class="card">
    <h2>현재 영업 중인 매장</h2>
    <span class="big" style="color: ${coffee.colors[name]}">${fmtInt(s.active)}</span>
  </div>
  <div class="card">
    <h2>누적 폐업 매장</h2>
    <span class="big">${fmtInt(s.closed)}</span>
  </div>
  <div class="card">
    <h2>폐업률</h2>
    <span class="big">${fmtPct(s.closureRate)}</span>
    <span class="muted">인허가 이력 ${fmtInt(s.episodes)}건 대비</span>
  </div>
  <div class="card">
    <h2>폐업 매장 중위 생존기간</h2>
    <span class="big">${years}년</span>
    <span class="muted">${fmtInt(Math.round(s.medianSurvivalDays))}일</span>
  </div>
</div>

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2" style="padding: 0px;">
    <div style="padding: 1rem;">
      <h2>${name} 매장 위치</h2>
      <h3>휠로 확대하고 드래그로 이동할 수 있습니다. 점 하나가 영업 중인 매장 1곳입니다.</h3>
    </div>
    <figure style="max-width: none; position: relative; margin: 0;">
      <div id="map-brand" style="border-radius: 8px; overflow: hidden; height: 560px; position: relative;"></div>
    </figure>
    <div style="padding: 0 1rem 1rem;">
      <p class="muted-note"><strong>읽는 법.</strong> 점이 몰린 곳이 ${name}의 매장 밀집 지역입니다. 같은 건물의 여러 매장은 겹쳐 보일 수 있습니다.</p>
      <p class="muted-note"><strong>데이터 한계.</strong> ${mapCoverageNote(coffee, name)}</p>
    </div>
  </div>
  <div class="card grid-colspan-1">
    <h2>시도별 영업 중 매장 수</h2>
    ${resize((width) => sidoBars(coffee, name, width))}
    <p class="muted-note"><strong>읽는 법.</strong> 막대가 길수록 해당 시도에 영업 중인 매장이 많습니다. 시도 합계는 같은 주소 중복을 제거한 기준이라 지도의 점 개수와 정확히 일치하지 않을 수 있습니다.</p>
  </div>
</div>

```js
const deckBrand = mountMap(document.getElementById("map-brand"), {coffee, geo, brand: name, zoom: 6.2});
invalidation.then(() => {
  deckBrand.finalize();
  document.getElementById("map-brand").innerHTML = "";
});
```

<div class="grid grid-cols-2">
  <div class="card">
    <h2>연도별 개업 · 폐업</h2>
    <h3>2005년 이후 · 진한 막대가 개업, 옅은 막대가 폐업</h3>
    ${resize((width) => yearlyBrand(coffee, name, width))}
    <p class="muted-note"><strong>읽는 법.</strong> 0선 위는 그해 개업, 아래는 폐업한 매장 수입니다. 아래 막대가 위 막대보다 길면 그해에는 닫은 매장이 새로 연 매장보다 많았다는 뜻입니다.</p>
  </div>
  <div class="card">
    <h2>폐업 매장 생존기간 분포</h2>
    <h3>${name}의 폐업 매장을 100%로 본 비율 · 점선은 10개 브랜드 전체 평균</h3>
    ${resize((width) => survivalBrand(coffee, name, width))}
    <p class="muted-note"><strong>읽는 법.</strong> 막대가 길수록 그 기간 안에 문을 닫은 매장이 많습니다. 점선 눈금보다 높으면 전체 평균보다 그 구간 비중이 큽니다. ${brandSurvivalNote(coffee, name)}</p>
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h2>매장이 많은 시군구 TOP 10</h2>
    ${resize((width) => sigunguTop(coffee, name, width))}
    <p class="muted-note"><strong>읽는 법.</strong> 주소의 시군구 단위로 센 영업 중 매장 수입니다. 서울은 구 단위, 경기도는 성남시·수원시처럼 시 단위로 묶여 있어 면적과 인구가 다른 지역끼리 단순 비교하기는 어렵습니다.</p>
  </div>
  <div class="card">
    <h2>${isStarbucks ? "스타벅스 인근 거리 분포" : "가장 가까운 스타벅스까지의 거리"}</h2>
    ${resize((width) => proximityBlock(coffee, name, width))}
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h2>개업 요일 분포</h2>
    <h3>${name} 개업 중 요일별 비중 (%) · 점선은 요일이 균등할 때(14.3%)</h3>
    ${resize((width) => weekdayBars(coffee, name, width))}
    <p class="muted-note"><strong>읽는 법.</strong> 막대가 점선(요일이 균등할 때의 비중)보다 높은 요일에 개업 인허가가 몰려 있습니다. 인허가일자 기준이라 실제 영업을 시작한 날과는 다를 수 있습니다.</p>
  </div>
  <div class="card">
    <h2>개업 월 분포</h2>
    <h3>${name} 개업 중 월별 비중 (%) · 점선은 월이 균등할 때(8.3%)</h3>
    ${resize((width) => monthBars(coffee, name, width))}
    <p class="muted-note"><strong>읽는 법.</strong> 막대가 점선(월이 균등할 때의 비중)보다 높은 달에 개업 인허가가 몰려 있습니다. 인허가일자 기준이며, 전체 관측 기간의 합계입니다.</p>
  </div>
</div>
