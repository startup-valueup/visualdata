// 대시보드 썸네일 자동 캡처.
//   npm run thumbs                 # 세 프로젝트 빌드 → _site 합치기 → 서버 → 캡처 → ../home/src/thumbs/*.webp
//   npm run thumbs -- --no-build   # 이미 합쳐 둔 _site 로 캡처만
//   npm run thumbs -- --only coffee-dams
//   npm run thumbs -- --fontsource # 구글 폰트 대신 @fontsource 글꼴을 강제로 쓴다
//
// 한글 글꼴: 캡처 시작 때 Google Fonts(Noto Sans KR)가 실제로 적용되는지 확인하고, 안 되면 fonts.googleapis.com 요청을 가로채
// @fontsource 의 같은 이름 글꼴로 대신 응답한다(페이지 코드는 그대로). 지도/차트가 비어 있으면(색이 거의 없으면) 저장하지 않고 실패한다.
import fs from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import sharp from "sharp";
import {composeSite} from "./compose-site.mjs";
import {startServer} from "./serve.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

const config = JSON.parse(fs.readFileSync(path.join(here, "thumbs.config.json"), "utf-8"));
const outDir = path.resolve(here, config.outDir);
const siteDir = path.resolve(here, "../_site");

if (!flag("--no-build")) composeSite({build: true});
else if (!fs.existsSync(siteDir)) throw new Error("_site 가 없습니다. --no-build 없이 실행하세요.");

const fontsourceRoot = path.dirname(path.dirname(require.resolve("@fontsource/noto-sans-kr/package.json")));
const {port, close} = await startServer({dir: siteDir, prefix: "/", port: config.server?.port ?? 4300, mounts: {"/__fontsource__/": fontsourceRoot}});
const base = `http://127.0.0.1:${port}`;

// 소프트웨어 렌더링 플래그: GPU 가 없는 환경에서도 deck.gl(WebGL) 지도가 그려지도록 한다.
const browser = await chromium.launch({args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});

async function googleFontsWork() {
  const page = await browser.newPage();
  try {
    await page.setContent('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400&display=swap"><p>한글</p>');
    await page.waitForLoadState("load", {timeout: 15000});
    return await page.evaluate(async () => {
      try { await document.fonts.load('400 32px "Noto Sans KR"', "한글"); } catch {}
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = '32px "Noto Sans KR", monospace';
      const withFont = ctx.measureText("한글가나다").width;
      ctx.font = "32px monospace";
      return withFont !== ctx.measureText("한글가나다").width;
    });
  } catch {
    return false;
  } finally {
    await page.close();
  }
}

const useFontsource = flag("--fontsource") || !(await googleFontsWork());
console.log(`글꼴: ${useFontsource ? "@fontsource(Noto Sans/Serif KR)로 대체" : "Google Fonts"}`);

async function newContext() {
  const context = await browser.newContext({viewport: config.viewport, deviceScaleFactor: 1});
  if (useFontsource) {
    await context.route("https://fonts.googleapis.com/**", (route) => {
      const families = [...new URL(route.request().url()).searchParams.getAll("family")].map((f) => f.split(":")[0].toLowerCase().replace(/\s+/g, "-"));
      const css = families.flatMap((f) => [400, 500, 600, 700].map((w) => `@import url("${base}/__fontsource__/${f}/${w}.css");`)).join("\n");
      route.fulfill({status: 200, contentType: "text/css", body: css});
    });
    await context.route("https://fonts.gstatic.com/**", (route) => route.abort());
  }
  return context;
}

// 두 캡처가 거의 같은지(차이가 큰 픽셀이 0.1% 미만). 안티앨리어싱·서브픽셀 흔들림은 허용한다.
async function almostSame(a, b) {
  const [ra, rb] = await Promise.all([a, b].map((x) => sharp(x).removeAlpha().raw().toBuffer({resolveWithObject: true})));
  if (ra.info.width !== rb.info.width || ra.info.height !== rb.info.height) return false;
  let diff = 0;
  for (let i = 0; i < ra.data.length; i += 3) {
    if (Math.abs(ra.data[i] - rb.data[i]) + Math.abs(ra.data[i + 1] - rb.data[i + 1]) + Math.abs(ra.data[i + 2] - rb.data[i + 2]) > 24) diff++;
  }
  return diff / (ra.data.length / 3) < 0.001;
}

async function distinctColors(buffer) {
  const {data} = await sharp(buffer).resize({width: 480}).removeAlpha().raw().toBuffer({resolveWithObject: true});
  const seen = new Set();
  for (let i = 0; i < data.length; i += 3) seen.add(((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4));
  return seen.size;
}

async function capture(item) {
  const context = await newContext();
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message.slice(0, 120)}`));
  await page.goto(`${base}${item.url}`, {waitUntil: "load"});
  for (const selector of item.waitFor ?? []) await page.waitForSelector(selector, {state: "visible", timeout: 30000});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(item.settleMs ?? 2000);

  // 캡처 전 동작(예: 지도 확대). wheel: selector 중앙에서 휠을 repeat 번 돌린다.
  for (const step of item.prepare ?? []) {
    if (step.type !== "wheel") throw new Error(`${item.id}: 알 수 없는 prepare 동작 ${step.type}`);
    const stepTarget = page.locator(step.selector).first();
    await stepTarget.scrollIntoViewIfNeeded(); // 화면 밖이면 마우스 이벤트가 닿지 않는다
    const box = await stepTarget.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < (step.repeat ?? 1); i++) {
      await page.mouse.wheel(0, step.deltaY);
      await page.waitForTimeout(step.delayMs ?? 300);
    }
  }
  await page.mouse.move(0, 0); // 마우스를 치워 툴팁·강조가 찍히지 않게 한다.

  const target = page.locator(item.selector).first();
  await target.scrollIntoViewIfNeeded();
  const clip = async () => {
    const box = await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height};
    });
    return {...box, height: Math.min(box.height, item.maxHeight ?? box.height)};
  };
  // 렌더가 끝났는지: 같은 영역을 연속으로 찍어 두 장이 거의 같아질 때까지 기다린다(애니메이션·타일·글꼴 아틀라스 로딩 대비).
  let shot = await page.screenshot({fullPage: true, clip: await clip()});
  let stable = false;
  for (let i = 0; i < 8 && !stable; i++) {
    await page.waitForTimeout(700);
    const next = await page.screenshot({fullPage: true, clip: await clip()});
    stable = await almostSame(shot, next);
    shot = next;
  }
  await context.close();

  const colors = await distinctColors(shot);
  if (colors < (config.minColors ?? 40)) throw new Error(`${item.id}: 캡처가 비어 있습니다(색 ${colors}개). 지도/차트가 그려지지 않았습니다.`);
  if (!stable) problems.push("렌더가 끝까지 안정되지 않았습니다(마지막 화면 사용)");
  fs.mkdirSync(outDir, {recursive: true});
  const file = path.join(outDir, item.file);
  const info = await sharp(shot).resize({width: config.image.width}).webp({quality: config.image.quality, effort: 6}).toFile(file);
  console.log(`${item.id}: ${path.relative(process.cwd(), file)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)}KB (색 ${colors}개)${problems.length ? " ⚠ " + problems.join("; ") : ""}`);
}

let failed = 0;
try {
  for (const item of config.items.filter((i) => !option("--only") || i.id === option("--only"))) {
    try { await capture(item); } catch (e) { failed++; console.error(`✗ ${e.message}`); }
  }
} finally {
  await browser.close();
  close();
}
process.exit(failed ? 1 : 0);
