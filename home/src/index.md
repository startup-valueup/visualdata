```js
import {renderHome} from "./components/cards.js";

// 제목·소개는 data/site.json, 카드는 data/dashboards.json 을 바탕으로 data/dashboard-cards.json.js 가 만든다.
const site = FileAttachment("data/site.json").json();
const cards = FileAttachment("data/dashboard-cards.json").json();
```

<style>
/* 중립 톤(air 테마): 회색 계열 + 테마 강조색(--theme-foreground-focus) 하나 */
.home { max-width: 1100px; margin: 0 auto; }
.home-hero { padding: 2.5rem 0 1.5rem; }
.home-hero h1 { font-size: 2.4rem; font-weight: 700; margin: 0 0 0.5rem; max-width: none; }
.home-tagline { font-size: 1.15rem; color: var(--theme-foreground-muted); margin: 0 0 1rem; max-width: none; }
.home-intro { max-width: 70ch; line-height: 1.75; margin: 0; }
.d-group { margin: 2.5rem 0; }
.d-group h2 { font-size: 1.5rem; margin: 0 0 0.35rem; }
.d-group-desc { color: var(--theme-foreground-muted); max-width: 70ch; margin: 0 0 1.25rem; }
.d-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 440px), 1fr)); gap: 1.25rem; }
.d-card { display: flex; flex-direction: column; background: var(--theme-background-alt); border: 1px solid var(--theme-foreground-faintest); border-radius: 10px; overflow: hidden; }
.d-thumb { display: block; aspect-ratio: 16 / 10; background: var(--theme-foreground-faintest); overflow: hidden; }
.d-thumb img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
.d-thumb-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--theme-foreground-muted); font-size: 0.9rem; }
.d-body { padding: 1rem 1.15rem 1.15rem; display: flex; flex-direction: column; gap: 0.6rem; flex: 1; }
.d-variant { display: inline-block; font-size: 0.75rem; font-weight: 600; color: var(--theme-foreground-focus); border: 1px solid var(--theme-foreground-focus); border-radius: 999px; padding: 0.1rem 0.6rem; }
.d-title { font-size: 1.2rem; margin: 0; }
.d-title a { color: inherit; }
.d-desc { margin: 0; max-width: none; line-height: 1.6; }
.d-note { margin: 0; max-width: none; font-size: 0.85rem; color: var(--theme-foreground-muted); line-height: 1.55; }
.d-tags { list-style: none; display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0; padding: 0; }
.d-tags li { font-size: 0.75rem; color: var(--theme-foreground-muted); background: var(--theme-foreground-faintest); border-radius: 4px; padding: 0.1rem 0.5rem; }
.d-meta { display: grid; grid-template-columns: auto 1fr; gap: 0.15rem 0.75rem; margin: 0; font-size: 0.8rem; }
.d-meta dt { color: var(--theme-foreground-muted); }
.d-meta dd { margin: 0; }
.d-stats { list-style: none; display: flex; gap: 1.25rem; margin: 0.25rem 0 0; padding: 0.75rem 0 0; border-top: 1px solid var(--theme-foreground-faintest); }
.d-stats li { display: flex; flex-direction: column; }
.d-stats b { font-size: 1.25rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.d-stats small { font-size: 0.75rem; font-weight: 500; margin-left: 0.15rem; color: var(--theme-foreground-muted); }
.d-stats span { font-size: 0.75rem; color: var(--theme-foreground-muted); }
.d-go { margin-top: auto; font-weight: 600; }
.site-footer { max-width: 1100px; margin: 3rem auto 1rem; font-size: 0.8rem; color: var(--theme-foreground-muted); line-height: 1.6; }
.site-footer ul { margin: 0.35rem 0 0; padding-left: 1.1rem; }
@media (max-width: 640px) { .home-hero h1 { font-size: 1.8rem; } .d-stats { gap: 0.9rem; } }
</style>

```js
// 인라인 표현식으로 쓰면 <p>로 감싸져 폭이 640px로 제한되므로 display() 로 직접 출력한다.
display(renderHome(site, cards));
```
