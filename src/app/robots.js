const siteUrl = "https://www.froggo.codes";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/my-courses", "/process-enrollment", "/profile"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
