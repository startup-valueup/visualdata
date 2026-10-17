// deck.gl 을 브라우저용 단일 ESM 파일로 미리 번들한다 (src/components/vendor/deck.js, gitignore 대상).
//
// 왜 필요한가: Framework 의 node import 번들러(rollup)는 (1) @loaders.gl/loader-utils 의 browser 필드("stream": false)를
// 적용하지 못해 `import "stream"` 이 그대로 남고, (2) 코드 분할로 생기는 추가 청크를 저장하지 않는다. esbuild 는 둘 다 처리한다.
// `npm run dev` / `npm run build` 전에 package.json 의 predev / prebuild 로 자동 실행된다.
import {build} from "esbuild";
import {mkdir} from "node:fs/promises";

await mkdir("src/components/vendor", {recursive: true});
await build({
  stdin: {
    contents: [
      'export {Deck} from "@deck.gl/core";',
      'export {GeoJsonLayer, ScatterplotLayer, TextLayer} from "@deck.gl/layers";'
    ].join("\n"),
    resolveDir: process.cwd()
  },
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  legalComments: "none",
  define: {"process.env.NODE_ENV": '"production"'},
  outfile: "src/components/vendor/deck.js",
  logLevel: "warning"
});
console.log("bundled deck.gl → src/components/vendor/deck.js");
