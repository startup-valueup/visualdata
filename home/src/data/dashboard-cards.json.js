// 데이터 로더(Node): dashboards.json 을 읽어, 각 대시보드의 핵심 숫자·기간을 해당 프로젝트의 집계 JSON 에서 계산하고
// 썸네일(home/src/thumbs/*.webp)을 data URI 로 붙여 카드 목록을 stdout 으로 내보낸다.
//
// - 숫자는 하드코딩하지 않는다. stats[].file 은 저장소 루트 기준 경로다.
// - 썸네일을 data URI 로 싣는 이유: Framework 는 정적으로 참조된 파일만 빌드 결과에 복사하는데, 카드는 dashboards.json 으로
//   동적으로 그려지기 때문이다. 파일이 없으면 thumbnail 은 null 이고 페이지가 자리표시자를 보여 준다.
// - 입력 파일이 바뀌어도 Framework 는 이 로더를 다시 실행하지 않는다. 개발 중에는 `npm run clean` 후 다시 실행하거나 이 파일을 저장하라.
import {existsSync, readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const repoRoot = new URL("../../../", import.meta.url); // home/src/data -> 저장소 루트
const homeSrc = new URL("../", import.meta.url);
const fmt = (n) => Number(n).toLocaleString("ko-KR");

const jsonCache = new Map();
function readJson(file) {
  if (!jsonCache.has(file)) {
    const url = new URL(file, repoRoot);
    if (!existsSync(fileURLToPath(url))) throw new Error(`dashboards.json 이 참조한 데이터 파일이 없습니다: ${file}`);
    jsonCache.set(file, JSON.parse(readFileSync(url, "utf-8")));
  }
  return jsonCache.get(file);
}

const numbers = (rows, field) => rows.map((d) => (field ? d[field] : d));

function compute({file, op, path, field}) {
  const rows = readJson(file)[path];
  if (!Array.isArray(rows)) throw new Error(`${file} 의 "${path}" 는 배열이어야 합니다.`);
  switch (op) {
    case "count":
      return fmt(rows.length);
    case "sum":
      return fmt(numbers(rows, field).reduce((s, v) => s + v, 0));
    case "max":
      return fmt(Math.max(...numbers(rows, field)));
    case "min":
      return fmt(Math.min(...numbers(rows, field)));
    case "range": {
      const values = numbers(rows, field);
      return `${Math.min(...values)}–${Math.max(...values)}`;
    }
    default:
      throw new Error(`알 수 없는 op: ${op}`);
  }
}

function thumbnail(name) {
  if (!name) return null;
  const url = new URL(`thumbs/${name}`, homeSrc);
  if (!existsSync(fileURLToPath(url))) return null;
  const mime = name.endsWith(".png") ? "image/png" : "image/webp";
  return `data:${mime};base64,${readFileSync(url).toString("base64")}`;
}

const {groups} = JSON.parse(readFileSync(new URL("dashboards.json", new URL("./", import.meta.url)), "utf-8"));

const out = groups.map((group) => ({
  ...group,
  dashboards: group.dashboards.map(({stats = [], period, thumbnail: thumb, ...d}) => ({
    ...d,
    period: period && typeof period === "object" ? compute(period) : (period ?? null),
    stats: stats.map((s) => ({label: s.label, value: compute(s), unit: s.unit ?? ""})),
    thumbnail: thumbnail(thumb)
  }))
}));

process.stdout.write(JSON.stringify({groups: out}));
