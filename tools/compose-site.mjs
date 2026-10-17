// 세 프로젝트를 빌드해 배포 구조로 합친다 → ../_site
//   home/ -> _site/        coffee/ -> _site/coffee/        coffee-dams/ -> _site/coffee-dams/
//   node compose-site.mjs            # 각 프로젝트 `npm run build` 후 합치기 (의존성은 미리 설치되어 있어야 함)
//   node compose-site.mjs --no-build # 이미 있는 dist 만 합치기
// 새 대시보드 프로젝트를 추가하면 아래 PROJECTS 에 한 줄 추가한다.
import {spawnSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PROJECTS = [
  {dir: "home", mount: ""},
  {dir: "coffee", mount: "coffee"},
  {dir: "coffee-dams", mount: "coffee-dams"}
];

export function composeSite({build = true} = {}) {
  const out = path.join(repo, "_site");
  fs.rmSync(out, {recursive: true, force: true});
  for (const {dir, mount} of PROJECTS) {
    const project = path.join(repo, dir);
    if (build) {
      console.log(`\n== build ${dir}`);
      // Framework 는 데이터 로더 입력(썸네일, 다른 프로젝트의 JSON)이 바뀌어도 로더를 다시 돌리지 않으므로 홈의 로더 캐시는 지운다.
      if (dir === "home") fs.rmSync(path.join(project, "src/.observablehq/cache/data"), {recursive: true, force: true});
      const r = spawnSync("npm", ["run", "build"], {cwd: project, stdio: "inherit", env: {...process.env, OBSERVABLE_TELEMETRY_DISABLE: "true"}});
      if (r.status !== 0) throw new Error(`${dir} 빌드 실패`);
    }
    const dist = path.join(project, "dist");
    if (!fs.existsSync(dist)) throw new Error(`${dir}/dist 가 없습니다. 먼저 빌드하세요.`);
    fs.cpSync(dist, path.join(out, mount), {recursive: true});
  }
  console.log(`\n합친 결과: ${out}`);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) composeSite({build: !process.argv.includes("--no-build")});
