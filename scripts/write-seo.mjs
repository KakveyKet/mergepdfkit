import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://usepdfeasy.com";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

// All public, indexable PDFEasy routes.
const routes = [
  // Main pages
  "/",
  "/tools",

  // PDF tools
  "/merge-pdf",
  "/split-pdf",
  "/jpg-to-pdf",
  "/rotate-pdf",
  "/organize-pdf",
  "/add-page-numbers",
  "/watermark-pdf",
  "/pdf-to-jpg",
  "/pdf-to-png",
  "/sign-pdf",
  "/compress-pdf",
  "/crop-pdf",

  // Guides
  "/guides",
  "/guides/how-to-merge-pdf",
  "/guides/is-online-pdf-merging-safe",
  "/guides/organize-pdf-files",
  "/guides/fix-pdf-merge-problems",
  "/guides/choose-pdf-order",

  // Information pages
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
];

// Remove duplicate routes, if any.
const uniqueRoutes = [...new Set(routes)];

// Escape characters that cannot appear
// directly in XML text.
function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createSitemap() {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const route of uniqueRoutes) {
    const url = `${SITE_URL}${route}`;

    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(url)}</loc>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");

  // The first character will be "<".
  // No blank lines or BOM before the declaration.
  return lines.join("\n") + "\n";
}

function createRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

function writeSeoFiles(directory) {
  fs.mkdirSync(directory, {
    recursive: true,
  });

  const sitemapFile = path.join(directory, "sitemap.xml");

  const robotsFile = path.join(directory, "robots.txt");

  const sitemap = createSitemap();
  const robots = createRobotsTxt();

  // Node writes UTF-8 without adding a BOM.
  fs.writeFileSync(sitemapFile, sitemap, {
    encoding: "utf8",
  });

  fs.writeFileSync(robotsFile, robots, {
    encoding: "utf8",
  });

  console.log(`Sitemap: ${sitemapFile}`);
  console.log(`Robots:  ${robotsFile}`);
}

function main() {
  console.log("Generating PDFEasy SEO files...");

  // Source files copied into Nuxt's static output.
  const publicDir = path.join(projectRoot, "public");

  writeSeoFiles(publicDir);

  // If Nuxt has already generated the website,
  // update the actual deployable output as well.
  const generatedDir = path.join(projectRoot, ".output", "public");

  if (fs.existsSync(generatedDir)) {
    writeSeoFiles(generatedDir);
  }

  console.log("");
  console.log(`Total sitemap URLs: ${uniqueRoutes.length}`);
  console.log("PDFEasy sitemap generation complete.");
}

main();
