import { Helmet } from "react-helmet-async";

const BASE_URL = "https://flexops.site";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export default function SEO({
  title,
  description,
  canonical,
  keywords,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  structuredData,
}) {
  const fullTitle = title ? `${title} | FlexOps` : "FlexOps — Gym Management Software for Indian Gyms";
  const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="FlexOps" />
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="FlexOps" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
