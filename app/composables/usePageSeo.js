export function usePageSeo({ title, description, path = "/" }) {
  const config = useRuntimeConfig();

  // Production website URL
  const siteUrl = String(config.public.siteUrl || "")
    .trim()
    .replace(/\/+$/, "");

  // Normalize path and remove query parameters
  const cleanPath = `/${String(path)
    .split(/[?#]/)[0]
    .replace(/^\/+|\/+$/g, "")}`;

  const canonicalUrl = /^https?:\/\/[^/]+/.test(siteUrl)
    ? `${siteUrl}${cleanPath}`
    : undefined;

  useSeoMeta({
    title,
    description,

    // Search engine instructions
    robots: "index, follow",

    // Open Graph
    ogTitle: title,
    ogDescription: description,
    ogType: "website",
    ogSiteName: "PDFEasy",
    ogLocale: "en_US",

    // Social sharing
    twitterCard: "summary",
    twitterTitle: title,
    twitterDescription: description,

    // Preferred URL
    ...(canonicalUrl ? { ogUrl: canonicalUrl } : {}),
  });

  if (canonicalUrl) {
    useHead({
      link: [
        {
          rel: "canonical",
          href: canonicalUrl,
        },
      ],
    });
  }
}
