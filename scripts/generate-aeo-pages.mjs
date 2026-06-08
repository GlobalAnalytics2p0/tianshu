import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const baseUrl = "https://tianshu.petrichor.tw";
const generatedAt = new Date().toISOString();

const activeTitles = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工"
];

const slugs = {
  星骸王座: "starbone-throne",
  灰塔觀測者: "gray-tower-observer",
  雪刃照孤城: "snowblade-lonely-city",
  凌晨三點的演算法: "algorithm-at-3am",
  大明墨工: "ming-inkwright"
};

const socialLinks = [
  "https://www.youtube.com/@tianshunovel",
  "https://www.facebook.com/profile.php?id=61590406722346",
  "https://www.instagram.com/tianshu_novel/",
  "https://www.threads.com/@tianshu_novel"
];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(value = "") {
  return escapeHtml(value);
}

function compact(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function truncate(value = "", length = 150) {
  const text = compact(value);
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function nonWhitespaceCount(value = "") {
  return String(value).replace(/\s/g, "").length;
}

function prefixForDepth(depth) {
  return "../".repeat(depth);
}

function assetPath(depth, resourcePath) {
  return `${prefixForDepth(depth)}${encodeURI(resourcePath)}`;
}

function pageUrl(pathname = "") {
  return `${baseUrl}/${pathname.replace(/^\/+/, "")}`;
}

function resourceUrl(resourcePath = "") {
  return `${baseUrl}/${encodeURI(resourcePath).replace(/^\/+/, "")}`;
}

function isoDate(value) {
  const date = value ? new Date(value) : new Date(generatedAt);
  if (Number.isNaN(date.getTime())) return generatedAt.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function latestDate(book) {
  const dates = book.chapters.map((chapter) => chapter.generatedAt).filter(Boolean);
  return isoDate(dates.at(-1) || generatedAt);
}

function chapterFileName(chapter) {
  return `chapter-${String(chapter.number).padStart(2, "0")}.html`;
}

function chapterDisplayTitle(chapter) {
  return `第${String(chapter.number).padStart(2, "0")}章 ${chapter.title}`;
}

function chapterParagraphs(content) {
  return content
    .split(/\n\s*\n+/)
    .map((paragraph) => compact(paragraph))
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("\n");
}

function baseHead({ title, description, canonical, image, depth, jsonLd }) {
  const prefix = prefixForDepth(depth);
  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="author" content="天書小說" />
    <meta name="theme-color" content="#05060a" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="${prefix}public/assets/tianshu-icon.png" type="image/png" />
    <meta property="og:locale" content="zh_TW" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="天書小說" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="${prefix}seo-pages.css?v=20260608-aeo" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head>`;
}

function nav(depth) {
  const prefix = prefixForDepth(depth);
  return `<nav class="seo-nav" aria-label="主要導覽">
  <a class="seo-brand" href="${prefix}">
    <img src="${prefix}public/assets/tianshu-icon.png" alt="" />
    <span><strong>天書小說</strong><span>每小時整點原創連載</span></span>
  </a>
  <div class="seo-nav__links">
    <a class="seo-pill" href="${prefix}books/">作品總覽</a>
    <a class="seo-pill" href="${prefix}#ranking">天書小說榜</a>
    <a class="seo-pill" href="https://www.youtube.com/@tianshunovel">YouTube</a>
  </div>
</nav>`;
}

function footer() {
  return `<footer class="seo-footer">
  <p>天書小說靜態閱讀頁由 <code>src/resource/manifest.json</code> 與章節文字檔生成，方便搜尋引擎理解作品、章節與更新脈絡。</p>
</footer>`;
}

function bookJsonLd(book, canonical, imageUrl) {
  const slug = slugs[book.title];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        "@id": `${canonical}#book`,
        name: book.title,
        author: { "@type": "Person", name: book.author },
        genre: book.category,
        inLanguage: "zh-Hant-TW",
        description: book.readerHook || book.premise,
        image: imageUrl,
        url: canonical,
        isPartOf: {
          "@type": "CreativeWorkSeries",
          name: "天書小說五部重點連載",
          url: pageUrl("books/")
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "天書小說", item: pageUrl("") },
          { "@type": "ListItem", position: 2, name: "作品總覽", item: pageUrl("books/") },
          { "@type": "ListItem", position: 3, name: book.title, item: pageUrl(`books/${slug}/`) }
        ]
      },
      {
        "@type": "ItemList",
        name: `${book.title}章節列表`,
        itemListElement: book.chapters.map((chapter, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: chapterDisplayTitle(chapter),
          url: pageUrl(`books/${slug}/${chapterFileName(chapter)}`)
        }))
      }
    ]
  };
}

function chapterJsonLd(book, chapter, canonical, imageUrl) {
  const slug = slugs[book.title];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Chapter",
        "@id": `${canonical}#chapter`,
        name: chapterDisplayTitle(chapter),
        headline: `${book.title} ${chapterDisplayTitle(chapter)}`,
        author: { "@type": "Person", name: book.author },
        inLanguage: "zh-Hant-TW",
        datePublished: chapter.generatedAt,
        dateModified: chapter.generatedAt,
        wordCount: chapter.charCount,
        image: imageUrl,
        url: canonical,
        isPartOf: {
          "@type": "Book",
          name: book.title,
          url: pageUrl(`books/${slug}/`)
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "天書小說", item: pageUrl("") },
          { "@type": "ListItem", position: 2, name: book.title, item: pageUrl(`books/${slug}/`) },
          { "@type": "ListItem", position: 3, name: chapterDisplayTitle(chapter), item: canonical }
        ]
      }
    ]
  };
}

function renderBooksIndex(books) {
  const canonical = pageUrl("books/");
  const description = "天書小說五部重點繁體中文原創長篇連載總覽，收錄玄幻、奇幻、武俠、都市與歷史作品。";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "天書小說作品總覽",
        url: canonical,
        description,
        inLanguage: "zh-Hant-TW"
      },
      {
        "@type": "ItemList",
        name: "天書小說五部重點連載",
        itemListElement: books.map((book, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: book.title,
          url: pageUrl(`books/${slugs[book.title]}/`)
        }))
      }
    ]
  };

  return `${baseHead({
    title: "天書小說作品總覽｜五部重點原創長篇連載",
    description,
    canonical,
    image: pageUrl("public/assets/tianshu-banner.png"),
    depth: 1,
    jsonLd
  })}
  <body>
    <main class="seo-shell">
      ${nav(1)}
      <section class="seo-index-hero">
        <div>
          <span class="seo-kicker">Featured Originals</span>
          <h1>五部重點連載，每個整點都往更深的世界推進。</h1>
          <p class="seo-lede">這裡整理天書小說目前集中更新的五部作品。每一本都有獨立作者聲線、主角命運、長線伏筆與有聲內容規劃。</p>
          <ul class="seo-meta">
            <li>每小時整點更新</li>
            <li>繁體中文原創</li>
            <li>小說、有聲書、影音企劃同步延伸</li>
          </ul>
        </div>
        <div class="seo-cover">
          <img src="../public/assets/tianshu-banner.png" alt="天書小說品牌主視覺" />
        </div>
      </section>
      <section class="seo-grid" aria-label="作品列表">
        ${books.map((book) => `<a class="seo-card" href="${slugs[book.title]}/">
          <img src="${assetPath(1, book.heroImage || book.coverImage)}" alt="${escapeHtml(book.title)}主視覺" />
          <div class="seo-card__body">
            <span>${escapeHtml(book.category)}</span>
            <strong>${escapeHtml(book.title)}</strong>
            <small>${escapeHtml(book.readerHook || book.premise)}</small>
          </div>
        </a>`).join("\n")}
      </section>
      ${footer()}
    </main>
  </body>
</html>
`;
}

function renderBookPage(book) {
  const slug = slugs[book.title];
  const canonical = pageUrl(`books/${slug}/`);
  const imageUrl = resourceUrl(book.heroImage || book.coverImage);
  const description = truncate(`${book.readerHook || book.premise} 作者：${book.author}。${book.authorIntro || ""}`, 155);
  const latestChapter = book.chapters.at(-1);

  return `${baseHead({
    title: `${book.title}｜${book.category}原創長篇連載｜天書小說`,
    description,
    canonical,
    image: imageUrl,
    depth: 2,
    jsonLd: bookJsonLd(book, canonical, imageUrl)
  })}
  <body>
    <main class="seo-shell">
      ${nav(2)}
      <section class="seo-hero">
        <div>
          <span class="seo-kicker">${escapeHtml(book.category)} Original</span>
          <h1>${escapeHtml(book.title)}</h1>
          <p class="seo-lede">${escapeHtml(book.readerHook || book.premise)}</p>
          <ul class="seo-meta">
            <li>作者：${escapeHtml(book.author)}</li>
            <li>${escapeHtml(book.status)}</li>
            <li>${book.chapters.length} 章連載中</li>
            <li>最新：${escapeHtml(chapterDisplayTitle(latestChapter))}</li>
          </ul>
          <p class="seo-lede">${escapeHtml(book.authorIntro || "")}</p>
          <div class="seo-nav__links">
            <a class="seo-button seo-button--gold" href="${chapterFileName(book.chapters[0])}">從第一章開始</a>
            <a class="seo-button" href="${chapterFileName(latestChapter)}">閱讀最新章</a>
          </div>
        </div>
        <div class="seo-cover">
          <img src="${assetPath(2, book.heroImage || book.coverImage)}" alt="${escapeHtml(book.title)}主視覺" />
        </div>
      </section>
      <section class="seo-section">
        <h2>章節列表</h2>
        <div class="chapter-list">
          ${[...book.chapters].reverse().map((chapter) => `<a href="${chapterFileName(chapter)}">
            <span>${String(chapter.number).padStart(2, "0")}</span>
            <strong>${escapeHtml(chapterDisplayTitle(chapter))}</strong>
            <small>${chapter.charCount || nonWhitespaceCount(chapter.content)} 字</small>
          </a>`).join("\n")}
        </div>
      </section>
      ${footer()}
    </main>
  </body>
</html>
`;
}

function renderChapterPage(book, chapter, index) {
  const slug = slugs[book.title];
  const canonical = pageUrl(`books/${slug}/${chapterFileName(chapter)}`);
  const imageUrl = resourceUrl(book.heroImage || book.coverImage);
  const previous = book.chapters[index - 1];
  const next = book.chapters[index + 1];
  const displayTitle = chapterDisplayTitle(chapter);
  const description = truncate(`${book.title}${displayTitle}：${chapter.content}`, 155);

  const chapterNav = `<nav class="chapter-nav" aria-label="章節切換">
    ${previous ? `<a href="${chapterFileName(previous)}">上一章：${escapeHtml(previous.title)}</a>` : "<span>沒有上一章</span>"}
    <a href="./">返回章節列表</a>
    ${next ? `<a href="${chapterFileName(next)}">下一章：${escapeHtml(next.title)}</a>` : "<span>沒有下一章</span>"}
  </nav>`;

  return `${baseHead({
    title: `${book.title} ${displayTitle}｜天書小說`,
    description,
    canonical,
    image: imageUrl,
    depth: 2,
    jsonLd: chapterJsonLd(book, chapter, canonical, imageUrl)
  })}
  <body>
    <main class="seo-shell">
      ${nav(2)}
      <article class="chapter-reader">
        <span class="seo-kicker">${escapeHtml(book.category)} · ${escapeHtml(book.author)}</span>
        <h1>${escapeHtml(displayTitle)}</h1>
        <p class="seo-lede">${escapeHtml(book.title)}｜${escapeHtml(book.readerHook || book.premise)}</p>
        <ul class="seo-meta">
          <li>作者：${escapeHtml(book.author)}</li>
          <li>字數：${chapter.charCount || nonWhitespaceCount(chapter.content)}</li>
          <li>更新：${escapeHtml(chapter.generatedAt || generatedAt)}</li>
        </ul>
        ${chapterNav}
        <div class="reader-text">
          ${chapterParagraphs(chapter.content)}
        </div>
        ${chapterNav}
      </article>
      ${footer()}
    </main>
  </body>
</html>
`;
}

async function readManifest() {
  const manifestPath = path.join(rootDir, "src/resource/manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const books = manifest.books.filter((book) => activeTitles.includes(book.title));

  for (const book of books) {
    book.chapters = await Promise.all(book.chapters.map(async (chapter) => {
      const content = await readFile(path.join(rootDir, chapter.path), "utf8");
      return {
        ...chapter,
        content,
        charCount: chapter.charCount || nonWhitespaceCount(content)
      };
    }));
  }

  return books.sort((a, b) => activeTitles.indexOf(a.title) - activeTitles.indexOf(b.title));
}

async function writeHtml(relativePath, html) {
  const outputPath = path.join(rootDir, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
}

function renderSitemap(books) {
  const urls = [
    { loc: pageUrl(""), lastmod: generatedAt.slice(0, 10), priority: "1.0" },
    { loc: pageUrl("books/"), lastmod: generatedAt.slice(0, 10), priority: "0.9" },
    ...books.flatMap((book) => {
      const slug = slugs[book.title];
      return [
        { loc: pageUrl(`books/${slug}/`), lastmod: latestDate(book), priority: "0.8" },
        ...book.chapters.map((chapter) => ({
          loc: pageUrl(`books/${slug}/${chapterFileName(chapter)}`),
          lastmod: isoDate(chapter.generatedAt),
          priority: "0.7"
        }))
      ];
    })
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${pageUrl("sitemap.xml")}
`;
}

function renderLlms(books) {
  return `# 天書小說

天書小說是繁體中文原創長篇連載平台，專注五部重點作品，並延伸有聲小說與 YouTube 說書企劃。

## 重要連結

- 首頁：${pageUrl("")}
- 作品總覽：${pageUrl("books/")}
- YouTube：https://www.youtube.com/@tianshunovel
- Facebook：https://www.facebook.com/profile.php?id=61590406722346
- Instagram：https://www.instagram.com/tianshu_novel/
- Threads：https://www.threads.com/@tianshu_novel

## 五部重點作品

${books.map((book) => `- ${book.title}（${book.category}，作者：${book.author}）：${book.readerHook || book.premise}
  - 作品頁：${pageUrl(`books/${slugs[book.title]}/`)}`).join("\n")}

## 內容政策

本站只發布原創繁體中文小說內容。章節文字的 canonical source 位於 src/resource/manifest.json 與 src/resource/<小說名>/ 文字檔，靜態 HTML 頁面由這些資源生成。
`;
}

async function main() {
  const books = await readManifest();

  await writeHtml("books/index.html", renderBooksIndex(books));

  for (const book of books) {
    const slug = slugs[book.title];
    await writeHtml(`books/${slug}/index.html`, renderBookPage(book));
    for (const [index, chapter] of book.chapters.entries()) {
      await writeHtml(`books/${slug}/${chapterFileName(chapter)}`, renderChapterPage(book, chapter, index));
    }
  }

  await writeFile(path.join(rootDir, "sitemap.xml"), renderSitemap(books), "utf8");
  await writeFile(path.join(rootDir, "robots.txt"), renderRobots(), "utf8");
  await writeFile(path.join(rootDir, "llms.txt"), renderLlms(books), "utf8");

  console.log(`Generated AEO pages for ${books.length} books and ${books.reduce((sum, book) => sum + book.chapters.length, 0)} chapters.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
