// 05. 지역 분포 지도 (ECharts registerMap 'korea').
// "전체 브랜드(점만)" / 브랜드 선택(시도 단계구분 + 흰 점). roam 가능. 타일 지도·연도 슬라이더는 범위 밖.
import {echarts, mountChart, registerKorea} from "../chart.js";
import {fmtInt} from "../format.js";
import {mapCoverageNote} from "../stats.js";
import {FONT, INK_DIM, LINE, PANEL_2, tooltipStyle} from "../theme.js";

const ALL = "__ALL__";

export function renderMap({element, selectEl, noteEl, coverageEl}, coffee, geo) {
  registerKorea(geo);
  const {brands, colors} = coffee;
  selectEl.replaceChildren(
    new Option("전체 브랜드 (매장 위치만 보기)", ALL),
    ...brands.map((b) => new Option(b, b))
  );
  let chart;

  function option(brand) {
    if (brand === ALL) {
      const series = brands.map((b) => ({
        name: b,
        type: "scatter",
        coordinateSystem: "geo",
        symbolSize: 3.2,
        itemStyle: {color: colors[b], opacity: 0.75},
        data: coffee.points.filter((p) => p.b === b).map((p) => [p.x, p.y])
      }));
      return {
        textStyle: {fontFamily: FONT},
        geo: {map: "korea", roam: true, itemStyle: {areaColor: PANEL_2, borderColor: LINE}, emphasis: {itemStyle: {areaColor: "#2C2418"}}, label: {show: false}},
        tooltip: {trigger: "item", ...tooltipStyle(12), formatter: (p) => p.seriesName},
        legend: {data: brands, top: 0, right: 0, textStyle: {color: INK_DIM, fontSize: 11}, icon: "circle", itemWidth: 8, itemHeight: 8},
        series
      };
    }
    const regionCounts = {};
    coffee.regional.filter((r) => r.brand === brand).forEach((r) => {
      regionCounts[r.sido] = r.count;
    });
    const mapData = geo.features.map((f) => ({name: f.properties.name, value: regionCounts[f.properties.name] || 0}));
    const pts = coffee.points.filter((p) => p.b === brand).map((p) => [p.x, p.y]);
    const maxV = Math.max(1, ...mapData.map((d) => d.value));
    return {
      textStyle: {fontFamily: FONT},
      visualMap: {
        seriesIndex: 0,
        min: 0,
        max: maxV,
        left: 16,
        bottom: 16,
        textStyle: {color: INK_DIM, fontSize: 11},
        inRange: {color: [PANEL_2, colors[brand]]},
        calculable: true
      },
      geo: {map: "korea", roam: true, label: {show: false}, itemStyle: {borderColor: "#0F0C08"}},
      tooltip: {
        ...tooltipStyle(12),
        formatter: (p) => (p.componentSubType === "scatter" ? brand : `${p.name}<br/>${brand}: <b>${fmtInt(p.value)}</b>곳`)
      },
      series: [
        {name: brand, type: "map", map: "korea", geoIndex: 0, data: mapData},
        {name: brand, type: "scatter", coordinateSystem: "geo", symbolSize: 2.6, itemStyle: {color: "#FFFFFF", opacity: 0.55}, data: pts, silent: true}
      ]
    };
  }

  function render(brand) {
    if (chart) chart.setOption(option(brand), true);
    else chart = mountChart(element, option(brand), {notMerge: true});
    noteEl.textContent =
      brand === ALL
        ? "10개 브랜드 전체 매장 위치 — 브랜드별 점 색상은 상단 범례를 참고하세요. 지도는 확대/이동이 가능합니다."
        : `${brand} — 시도별 매장 수는 색의 진하기로, 개별 매장 위치는 흰 점으로 표시했습니다.`;
    coverageEl.textContent = mapCoverageNote(coffee, brand === ALL ? null : brand);
  }

  selectEl.addEventListener("change", () => render(selectEl.value));
  render(ALL);
}
