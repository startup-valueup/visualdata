import * as echarts from "npm:echarts@5.5.0";

export {echarts};

// 지도 섹션이 쓰는 'korea' 맵을 한 번만 등록한다.
let registered = false;
export function registerKorea(geo) {
  if (registered) return;
  echarts.registerMap("korea", geo);
  registered = true;
}

// element 에 ECharts 인스턴스를 만들고 option 을 적용한다.
// 레거시의 window 'resize' 리스너 대신 ResizeObserver 로 컨테이너 크기 변화에 대응한다.
// (개발 서버에서 코드 블록이 다시 실행되면 이전 인스턴스를 먼저 정리한다.)
export function mountChart(element, option, {notMerge = false} = {}) {
  echarts.getInstanceByDom(element)?.dispose();
  const chart = echarts.init(element);
  chart.setOption(option, notMerge);
  const observer = new ResizeObserver(() => chart.resize());
  observer.observe(element);
  return chart;
}

export function byId(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`#${id} 요소를 찾을 수 없습니다.`);
  return element;
}
