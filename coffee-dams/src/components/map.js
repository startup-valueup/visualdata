// deck.gl 지도: us-dams 예제와 같이 타일 없이 행정경계 GeoJSON(GeoJsonLayer)을 베이스맵으로 쓰고,
// 매장 좌표를 ScatterplotLayer 로 얹는다. API 토큰이 필요한 타일은 사용하지 않는다.
// 예제의 `npm:deck.gl`(UMD 번들의 DeckGL 래퍼) 대신 로컬 설치한 @deck.gl/core 의 Deck 클래스를 쓴다(container -> parent).
// Framework 번들러는 deck.gl 의존성(@loaders.gl 의 `import "stream"`, 코드 분할 청크)을 처리하지 못해,
// scripts/bundle-deck.mjs 가 esbuild 로 core/layers 만 미리 번들한다(predev/prebuild 에서 자동 실행).
import {Deck, GeoJsonLayer, ScatterplotLayer, TextLayer} from "./vendor/deck.js"; // scripts/bundle-deck.mjs 가 생성
import {polygonArea, polygonCentroid} from "d3";
import {hexToRgb, sidoShort} from "./format.js";

// 한국 초기 뷰: 제주~강원 북단이 한 화면에 들어오는 중심/줌. 줌 범위는 전국~동네 수준으로 제한한다.
// 시도 라벨 위치: 가장 큰 폴리곤 바깥 고리의 평면 중심.
// (d3.geoCentroid 는 이 경계 파일의 고리 방향 때문에 지구 반대편 좌표를 돌려줘서 쓰지 않는다.)
// 서울을 둘러싼 경기도는 평면 중심이 서울과 겹쳐서 라벨만 북쪽으로 옮긴다.
const LABEL_OVERRIDES = {경기도: [127.35, 37.8]};

function labelPosition(feature) {
  const override = LABEL_OVERRIDES[feature.properties.name];
  if (override) return override;
  const {type, coordinates} = feature.geometry;
  const rings = (type === "Polygon" ? [coordinates] : coordinates).map((polygon) => polygon[0]);
  const largest = rings.reduce((a, b) => (Math.abs(polygonArea(b)) > Math.abs(polygonArea(a)) ? b : a));
  return polygonCentroid(largest);
}

const KOREA_VIEW = {longitude: 127.8, latitude: 36.2, minZoom: 5, maxZoom: 12, pitch: 0, bearing: 0};

export function mountMap(container, {coffee, geo, brand = null, zoom = 6.4}) {
  const rgb = Object.fromEntries(Object.entries(coffee.colors).map(([b, c]) => [b, hexToRgb(c)]));
  const points = brand ? coffee.points.filter((p) => p.b === brand) : coffee.points;
  const labels = geo.features.map((f) => ({name: sidoShort(f.properties.name), position: labelPosition(f)}));

  return new Deck({
    parent: container,
    initialViewState: {...KOREA_VIEW, zoom},
    controller: true,
    getTooltip: ({object}) => object && object.b,
    layers: [
      new GeoJsonLayer({
        id: "base-map",
        data: geo,
        lineWidthMinPixels: 1,
        getLineColor: [255, 255, 255, 100],
        getFillColor: [38, 38, 38]
      }),
      new ScatterplotLayer({
        id: "stores",
        data: points,
        pickable: true,
        radiusMinPixels: 1.5,
        radiusMaxPixels: 6,
        getRadius: 450,
        getPosition: (d) => [d.x, d.y],
        getFillColor: (d) => rgb[d.b],
        opacity: 0.8
      }),
      new TextLayer({
        id: "sido-labels",
        data: labels,
        getPosition: (d) => d.position,
        getText: (d) => d.name,
        characterSet: "auto", // 기본값은 ASCII 뿐이라 한글 라벨이 누락된다
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 700,
        fontSettings: {sdf: true},
        outlineWidth: 4,
        getSize: 13,
        getColor: [247, 248, 243, 220],
        getTextAnchor: "middle",
        getAlignmentBaseline: "center"
      })
    ]
  });
}
