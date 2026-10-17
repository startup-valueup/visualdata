// 정적 서버: GitHub Pages 처럼 확장자 없는 URL(.html)과 디렉터리 index 를 서빙하고, 선택적으로 하위 경로(prefix)를 붙인다.
//   node serve.mjs [dir=../_site] [--prefix /visualdata/] [--port 4300]
// 다른 스크립트에서는 startServer() 를 import 해서 쓴다. `mounts` 로 임의 디렉터리를 추가 경로에 노출할 수 있다(글꼴 주입용).
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".woff": "font/woff", ".woff2": "font/woff2"
};

export function startServer({dir, prefix = "/", port = 0, mounts = {}}) {
  const root = path.resolve(dir);
  const send = (res, file) => {
    res.writeHead(200, {"content-type": TYPES[path.extname(file)] ?? "application/octet-stream", "access-control-allow-origin": "*"});
    fs.createReadStream(file).pipe(res);
  };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    for (const [mountPath, mountDir] of Object.entries(mounts)) {
      if (url.startsWith(mountPath)) {
        const file = path.join(mountDir, url.slice(mountPath.length));
        if (file.startsWith(mountDir) && fs.existsSync(file) && fs.statSync(file).isFile()) return send(res, file);
      }
    }
    if (!url.startsWith(prefix)) { res.writeHead(404); return res.end("not under prefix"); }
    const rel = url.slice(prefix.length);
    for (const candidate of [rel, `${rel}.html`, path.join(rel, "index.html")]) {
      const file = path.join(root, candidate);
      if (file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isFile()) return send(res, file);
    }
    res.writeHead(404); res.end("not found");
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({server, port: server.address().port, close: () => server.close()})));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
  const dir = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")) ?? "../_site";
  const {port, } = await startServer({dir, prefix: opt("--prefix", "/"), port: Number(opt("--port", 4300))});
  console.log(`serving ${path.resolve(dir)} at http://127.0.0.1:${port}${opt("--prefix", "/")}`);
}
