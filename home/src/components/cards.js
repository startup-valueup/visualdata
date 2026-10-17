// 홈 화면 렌더링: site.json 과 dashboard-cards.json 으로 소개 + 대시보드 카드 그리드를 만든다.
// Framework 의 html 템플릿(htl)은 CDN 에서 받아오므로 쓰지 않고 DOM 으로 만든다.

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function card(d) {
  const href = `./${d.path}`;
  const article = el("article", "d-card");

  const thumb = el("a", "d-thumb");
  thumb.href = href;
  thumb.setAttribute("aria-label", `${d.title} (${d.variant}) 열기`);
  if (d.thumbnail) {
    const img = el("img");
    img.src = d.thumbnail;
    img.alt = d.thumbnailAlt ?? d.title;
    img.loading = "lazy";
    thumb.append(img);
  } else {
    thumb.append(el("span", "d-thumb-empty", "미리보기 준비 중"));
  }

  const body = el("div", "d-body");
  const head = el("div", "d-head");
  if (d.variant) head.append(el("span", "d-variant", d.variant));
  const title = el("h3", "d-title");
  const titleLink = el("a", "", d.title);
  titleLink.href = href;
  title.append(titleLink);
  body.append(head, title, el("p", "d-desc", d.description));
  if (d.variantNote) body.append(el("p", "d-note", d.variantNote));

  const tags = el("ul", "d-tags");
  for (const t of d.tags ?? []) tags.append(el("li", "", t));
  body.append(tags);

  const meta = el("dl", "d-meta");
  for (const [k, v] of [["데이터 출처", d.source], ["데이터 기간", d.period]]) {
    if (!v) continue;
    meta.append(el("dt", "", k), el("dd", "", v));
  }
  body.append(meta);

  const stats = el("ul", "d-stats");
  for (const s of d.stats ?? []) {
    const li = el("li");
    const value = el("b", "", s.value);
    if (s.unit) value.append(el("small", "", s.unit));
    li.append(value, el("span", "", s.label));
    stats.append(li);
  }
  body.append(stats);

  const go = el("a", "d-go", "대시보드 열기 →");
  go.href = href;
  body.append(go);

  article.append(thumb, body);
  return article;
}

export function renderHome(site, cards) {
  const root = el("div", "home");
  const hero = el("header", "home-hero");
  hero.append(el("h1", "", site.title), el("p", "home-tagline", site.tagline), el("p", "home-intro", site.intro));
  root.append(hero);

  for (const group of cards.groups) {
    const section = el("section", "d-group");
    section.id = group.id;
    section.append(el("h2", "", group.title));
    if (group.description) section.append(el("p", "d-group-desc", group.description));
    const grid = el("div", "d-grid");
    for (const d of group.dashboards) grid.append(card(d));
    section.append(grid);
    root.append(section);
  }
  return root;
}
