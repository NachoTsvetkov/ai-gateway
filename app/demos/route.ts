import { PROJECTS } from "lib/projects-data";

export const dynamic = "force-static";

const CANONICAL = "https://nachotsvetkov.com/demos";
const TITLE = "Demos";
const DESCRIPTION = "Labelled demo pages on this site.";
const OG_IMAGE = "https://nachotsvetkov.com/opengraph-image";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render(): string {
  const items = PROJECTS.map((project) => {
    const tech =
      project.tech.length > 0
        ? `<p class="tech">${escapeHtml(project.tech.join(" · "))}</p>`
        : "";
    return `<li><a href="${escapeHtml(project.href)}">${escapeHtml(project.title)}</a>${tech}</li>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(TITLE)}</title>
<meta name="description" content="${escapeHtml(DESCRIPTION)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${escapeHtml(CANONICAL)}">
<meta property="og:title" content="${escapeHtml(TITLE)}">
<meta property="og:description" content="${escapeHtml(DESCRIPTION)}">
<meta property="og:url" content="${escapeHtml(CANONICAL)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${escapeHtml(OG_IMAGE)}">
<meta property="og:image:type" content="image/png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(TITLE)}">
<meta name="twitter:description" content="${escapeHtml(DESCRIPTION)}">
<meta name="twitter:image" content="${escapeHtml(OG_IMAGE)}">
<style>
body{margin:0;font-family:system-ui,sans-serif;background:#fafafa;color:#171717}
main{max-width:40rem;margin:0 auto;padding:4rem 1.5rem}
h1{font-size:1.875rem;margin:0;letter-spacing:-0.025em}
.intro{margin:.75rem 0 0;color:#525252}
ul{list-style:none;margin:2.5rem 0 0;padding:0}
li{border-top:1px solid #e5e5e5;padding:1.5rem 0}
li:first-child{border-top:0;padding-top:0}
a{color:#171717;font-weight:600;text-decoration:none}
a:hover{text-decoration:underline;text-underline-offset:2px}
.tech{margin:.5rem 0 0;color:#525252;font-size:.875rem}
</style>
</head>
<body>
<main>
<h1>${escapeHtml(TITLE)}</h1>
<p class="intro">${escapeHtml(DESCRIPTION)}</p>
<ul>${items}</ul>
</main>
</body>
</html>
`;
}

export function GET(): Response {
  return new Response(render(), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
