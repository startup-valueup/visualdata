---
title: 대한민국 커피 프랜차이즈 지형도
toc: false
---

```js
import {byId} from "./components/chart.js";
import {fmtInt} from "./components/format.js";
import {renderStatRow, renderBrandLegend} from "./components/hero.js";
import {heroStats, survivalDescription, survivalReadNote, cumulativeGap} from "./components/stats.js";
import {renderActiveBar, renderClosureBubble} from "./components/charts/stores.js";
import {renderGrowthLine} from "./components/charts/growth.js";
import {renderEntryExit} from "./components/charts/entry-exit.js";
import {renderSurvival} from "./components/charts/survival.js";
import {renderMap} from "./components/charts/map.js";
import {renderSigunguTop, renderSigunguTable} from "./components/charts/sigungu.js";
import {renderWeekday, renderMonth} from "./components/charts/seasonality.js";
import {renderProximity} from "./components/charts/proximity.js";

// 집계 JSON(레거시 v1 HTML 에서 추출) — 원본 CSV 는 이 저장소에 없다.
const coffee = FileAttachment("data/coffee.json").json();
const geo = FileAttachment("data/skorea.json").json();
```

```js
const hero = heroStats(coffee);
const gap = cumulativeGap(coffee);
const stats = [
  {num: fmtInt(hero.active), lbl: "현재 영업 중인 매장"},
  {num: fmtInt(hero.closed), lbl: "누적 폐업 매장"},
  {num: hero.brandCount, lbl: "분석 대상 브랜드"},
  {num: fmtInt(hero.vending), lbl: "자판기 · 무인카페 (별도 집계)"},
  {num: `${hero.minYear}–${hero.maxYear}`, lbl: "인허가 데이터 관측 기간"}
];
renderStatRow("statRow", stats);
renderBrandLegend("brandLegend", coffee);
```

<header class="hero wrap">
<div class="kicker">행정안전부 지방행정 인허가 데이터 기반 분석</div>
<h1 class="title">대한민국 커피 프랜차이즈 지형도</h1>
<p class="lede">전국 10개 주요 커피 브랜드의 인허가 이력 <span id="ledeTotalEpisodes">${fmtInt(hero.episodes)}</span>건을 정제해, 출점 속도와 폐업률, 상권 밀도, 그리고 스타벅스 인근 입지 효과까지 브랜드별 확장 전략의 차이를 데이터로 살펴봅니다.</p>
<div class="stat-row" id="statRow"></div>
<div class="legend-swatches" id="brandLegend" style="margin-top:22px;"></div>
</header>

<section class="wrap">
<div class="sec-head"><span class="sec-num">01</span><h2 class="sec-title">브랜드별 매장 현황</h2></div>
<p class="sec-desc">현재 영업 중인 매장 수와, 전체 인허가 이력 중 폐업으로 종료된 비율을 함께 봅니다. 매장 수가 많다고 안정적인 것은 아닙니다 — 얼마나 많은 매장이 문을 닫았는지가 브랜드 확장 방식을 더 잘 설명합니다.</p>
<div class="grid-2">
<div class="panel"><div id="chartActiveBar" class="chart h-440"></div></div>
<div class="panel"><div id="chartClosureBubble" class="chart h-440"></div>
<p class="note">가로축: 폐업률(%) · 세로축: 폐업 매장의 중위 생존일수 · 원 크기: 현재 매장 수</p>
</div>
</div>
<p class="read-note"><strong>읽는 법.</strong> 왼쪽은 막대가 길수록 현재 영업 중인 매장이 많은 브랜드입니다. 오른쪽에서는 원이 오른쪽에 있을수록 폐업률이 높고, 위쪽에 있을수록 폐업한 매장이 오래 영업했던 브랜드입니다. 폐업률은 전체 인허가 이력 대비 비율이라, 출점한 지 얼마 안 된 브랜드는 폐업할 시간이 적어 낮게 나올 수 있습니다.</p>
</section>

```js
renderActiveBar(byId("chartActiveBar"), coffee);
renderClosureBubble(byId("chartClosureBubble"), coffee);
```

<section class="wrap">
<div class="sec-head"><span class="sec-num">02</span><h2 class="sec-title">누적 매장 수 성장 곡선</h2></div>
<p class="sec-desc">개업에서 폐업을 뺀 순증감을 매년 누적한 값입니다. 후발주자인 저가 커피 브랜드가 언제부터, 얼마나 가파르게 스타벅스·이디야를 추격했는지 드러납니다.</p>
<div class="panel"><div id="chartGrowthLine" class="chart h-440"></div></div>
<p class="read-note"><strong>읽는 법.</strong> 선이 가파르게 올라가는 구간이 출점이 몰린 시기이고, 선이 평평해지면 순증가가 멈춘 것, 내려가면 그해 폐업이 개업보다 많았다는 뜻입니다. 인허가 이력을 기준으로 계산한 값이라 ${gap.maxYear}년 값은 현재 영업 중인 매장 수와 브랜드별로 최대 ${gap.maxGap}곳까지 차이가 납니다.</p>
</section>

```js
renderGrowthLine(byId("chartGrowthLine"), coffee);
```

<section class="wrap">
<div class="sec-head"><span class="sec-num">03</span><h2 class="sec-title">연도별 출점과 폐업</h2></div>
<p class="sec-desc">브랜드를 선택하면 해당 연도에 새로 문을 연 매장(위)과 문을 닫은 매장(아래)을 함께 보여줍니다.</p>
<div class="panel">
<div class="tabbar" id="entryExitTabs"></div>
<div id="chartEntryExit" class="chart h-380"></div>
</div>
<p class="read-note"><strong>읽는 법.</strong> 0선 위 막대는 그해 개업, 아래 막대는 폐업한 매장 수입니다. 아래 막대가 위 막대보다 길면 그해에는 닫은 매장이 새로 연 매장보다 많았다는 뜻입니다. 마지막 연도(${hero.maxYear}년)는 한 해가 모두 채워지지 않은 중간 집계일 수 있습니다.</p>
</section>

```js
renderEntryExit(byId("chartEntryExit"), "entryExitTabs", coffee);
```

<section class="wrap">
<div class="sec-head"><span class="sec-num">04</span><h2 class="sec-title">폐업 매장의 생존 기간</h2></div>
<p class="sec-desc">${survivalDescription(coffee)}</p>
<div class="panel"><div id="chartSurvival" class="chart h-440"></div></div>
<p class="read-note"><strong>읽는 법.</strong> ${survivalReadNote(coffee)}</p>
</section>

```js
renderSurvival(byId("chartSurvival"), coffee);
```

<section class="wide">
<div class="sec-head"><span class="sec-num">05</span><h2 class="sec-title">지역별 매장 분포</h2></div>
<p class="sec-desc">시도는 색의 진하기로, 개별 매장은 실제 좌표 점으로 함께 표시합니다. 브랜드를 바꿔가며 수도권 집중도와 지방 확산 양상을 비교해보세요.</p>
<div class="panel">
<div class="tabbar">
<select id="mapBrandSelect" class="select"></select>
</div>
<div id="chartMap" class="chart h-560"></div>
<p class="note" id="mapNote"></p>
<p class="note" id="mapCoverage"></p>
</div>
</section>

```js
renderMap(
  {element: byId("chartMap"), selectEl: byId("mapBrandSelect"), noteEl: byId("mapNote"), coverageEl: byId("mapCoverage")},
  coffee,
  geo
);
```

<section class="wrap">
<div class="sec-head"><span class="sec-num">06</span><h2 class="sec-title">매장이 가장 밀집한 상권</h2></div>
<p class="sec-desc">시군구 단위로, 10개 브랜드를 합친 매장 수가 가장 많은 지역과 브랜드별 개별 TOP 10입니다.</p>
<div class="grid-2">
<div class="panel"><div id="chartSigunguTop" class="chart h-440"></div></div>
<div class="panel">
<div class="tabbar" id="sigunguTabs"></div>
<table class="rank" id="sigunguTable"><thead><tr><th>상권</th><th style="text-align:right">매장 수</th></tr></thead><tbody></tbody></table>
</div>
</div>
<p class="read-note"><strong>읽는 법.</strong> 막대가 길수록 해당 지역에 영업 중인 매장이 많다는 뜻입니다. 지역은 주소의 시도와 시군구 단위로 묶어서 서울은 구 단위, 경기도는 성남시·수원시처럼 시 단위로 나뉘어 있으므로, 면적과 인구가 다른 지역끼리 순위를 단순 비교하기는 어렵습니다.</p>
</section>

```js
renderSigunguTop(byId("chartSigunguTop"), coffee);
renderSigunguTable("sigunguTabs", document.querySelector("#sigunguTable tbody"), coffee);
```

<section class="wrap">
<div class="sec-head"><span class="sec-num">07</span><h2 class="sec-title">개업 요일·월별 패턴</h2></div>
<p class="sec-desc">인허가일자를 기준으로 본 브랜드별 개업 시점 습관입니다. 특정 요일에 몰리는 브랜드는 본사 차원의 오픈 일정 관리를, 계절 편중이 큰 브랜드는 상권 오픈 타이밍 전략을 짐작하게 합니다.</p>
<div class="grid-2">
<div class="panel"><div id="chartWeekday" class="chart h-320"></div></div>
<div class="panel"><div id="chartMonth" class="chart h-320"></div></div>
</div>
<p class="read-note"><strong>읽는 법.</strong> 각 선은 브랜드별 전체 개업 중 해당 요일·월이 차지하는 비중(%)이며, 선이 높은 곳에 개업 인허가가 몰려 있습니다. 인허가일자 기준이라 실제 영업을 시작한 날과는 다를 수 있습니다.</p>
</section>

```js
renderWeekday(byId("chartWeekday"), coffee);
renderMonth(byId("chartMonth"), coffee);
```

<section class="wrap nodivide">
<div class="sec-head"><span class="sec-num">08</span><h2 class="sec-title">스타벅스 곁에 자리 잡는 브랜드들</h2></div>
<p class="sec-desc">"제3의 장소"로서 스타벅스가 유동인구를 만든다면, 그 옆에 다른 카페들이 따라붙는지 확인할 수 있습니다. 각 브랜드 매장이 가장 가까운 스타벅스로부터 얼마나 떨어져 있는지를 거리 구간별 비율로 나눴습니다.</p>
<div class="panel"><div id="chartProximity" class="chart h-440"></div></div>
<p class="read-note"><strong>읽는 법.</strong> 막대 아래쪽의 밝은 금색 구간일수록 가장 가까운 스타벅스까지의 거리가 짧은 매장 비율입니다. 좌표가 있는 영업 중 매장끼리의 직선거리 기준이며, 같은 상권에 자연스럽게 몰린 결과인지 스타벅스를 따라 입점한 결과인지는 이 데이터만으로 구분할 수 없습니다.</p>
</section>

```js
renderProximity(byId("chartProximity"), coffee);
```

<footer class="wrap">
<p><strong style="color:var(--ink-dim)">데이터 & 방법론.</strong> 행정안전부 지방행정 인허가 데이터(식품업종 전체)에서 브랜드명을 매칭해 수집한 사업장 목록입니다. 업태가 휴게음식점·일반음식점·제과점영업인 건만 "매장"으로 집계했고, 물류센터·유통 등 명백히 매장이 아닌 항목은 제외했습니다. 자판기/무인카페 항목은 별도 카테고리로 분리했습니다(지도·매장수 집계에는 포함하지 않음). 동일 브랜드·주소로 여러 차례 인허가가 난 경우, 매장 수 집계와 지도에는 가장 최근 건 하나만 남겼고, 개업/폐업/생존기간 분석에는 인허가 이력 전체를 사용했습니다. 인허가 데이터 특성상 실제 폐업/영업 상태 반영에 시차가 있을 수 있습니다.</p>
</footer>
