import { offerings, faqs, storeLinks } from "./catalog.js";
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
export function seo(lang = "en", launch = false) {
  const hi = lang === "hi";
  const title = hi
    ? "वेदांश (Vedansh) ऐप — भगवद् गीता, पंचांग और जप"
    : "Vedansh App — Bhagavad Gita, Panchang & Japa";
  const description = hi
    ? "रोज़ की भक्ति का साथी, हिन्दी और अंग्रेज़ी में: भगवद् गीता और दूसरे पावन ग्रंथ किताब जैसे पाठ में, सही पंचांग और मुहूर्त, व्रत-कथा-विधि, कुंडली और गुण मिलान, संकल्प और जप। मुफ़्त।"
    : "A bilingual companion for daily Hindu devotion: the Bhagavad Gita and other sacred texts in a book-like reader, an accurate daily Panchang with Muhurat, vrat kathas and vidhi, Kundali and Guna Milan, Sankalp programmes and japam. Free.";
  const url = "https://vedansh.app" + (hi ? "/hi/" : "/");
  const graph = [
    {
      "@type": "Organization",
      "@id": "https://vedansh.app/#organization",
      name: "Vedansh",
      alternateName: ["Vedansh App", "Vedansh app", "Vedaansh", "Vedaansh App", "Vedānsh", "वेदांश", "वेदांश ऐप", "vedansh.app"],
      url: "https://vedansh.app/",
      logo: "https://vedansh.app/images/icon.png",
      sameAs: ["https://www.instagram.com/vedansh.app/"],
    },
    {
      "@type": "MobileApplication",
      "@id": "https://vedansh.app/#app",
      name: "Vedansh",
      alternateName: ["Vedansh App", "Vedansh app", "Vedaansh", "Vedaansh App", "Vedānsh", "वेदांश", "वेदांश ऐप", "vedansh.app"],
      applicationCategory: "LifestyleApplication",
      operatingSystem: "iOS, Android",
      url: "https://vedansh.app/",
      installUrl: [storeLinks.ios, storeLinks.android],
      image: "https://vedansh.app/images/icon.png",
      description,
      inLanguage: ["hi", "en"],
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      featureList: offerings.map((f) => (hi ? f.hi : f.en)),
      publisher: { "@id": "https://vedansh.app/#organization" },
    },
    {
      "@type": "WebSite",
      "@id": "https://vedansh.app/#website",
      name: "Vedansh",
      alternateName: ["Vedansh App", "Vedansh app", "Vedaansh", "Vedaansh App", "Vedānsh", "वेदांश", "वेदांश ऐप", "vedansh.app"],
      url: "https://vedansh.app/",
      publisher: { "@id": "https://vedansh.app/#organization" },
      inLanguage: ["hi", "en"],
    },
    {
      "@type": "WebPage",
      "@id": url + "#webpage",
      url,
      name: title,
      description,
      inLanguage: lang,
      isPartOf: { "@id": "https://vedansh.app/#website" },
      about: { "@id": "https://vedansh.app/#app" },
    },
    {
      "@type": "ItemList",
      "@id": url + "#offerings",
      name: hi ? "वेदांश की सुविधाएँ" : "Vedansh app offerings",
      numberOfItems: offerings.length,
      itemListElement: offerings.map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Thing",
          name: hi ? f.hi : f.en,
          description: hi ? f.descriptionHi : f.description,
          url: url + "#" + f.id,
        },
      })),
    },
    {
      "@type": "FAQPage",
      "@id": url + "#questions",
      mainEntity: faqs.map(([q, a, qHi, aHi]) => ({
        "@type": "Question",
        name: hi ? qHi : q,
        acceptedAnswer: { "@type": "Answer", text: hi ? aHi : a },
      })),
    },
  ];
  return `<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}"/>
<meta name="robots" content="${launch ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,follow"}"/>
<meta name="theme-color" content="#F3E7C9"/>
<meta name="apple-itunes-app" content="app-id=6766086529"/>
<link rel="canonical" href="${url}"/>
<link rel="alternate" hreflang="en-IN" href="https://vedansh.app/"/>
<link rel="alternate" hreflang="hi-IN" href="https://vedansh.app/hi/"/>
<link rel="alternate" hreflang="x-default" href="https://vedansh.app/"/>
<link rel="icon" type="image/png" href="/assets/favicon.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="preload" as="image" href="/assets/hero-krishna-arjuna.webp"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Vedansh"/>
<meta property="og:title" content="${escape(title)}"/>
<meta property="og:description" content="${escape(description)}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:locale" content="${hi ? "hi_IN" : "en_IN"}"/>
<meta property="og:locale:alternate" content="${hi ? "en_IN" : "hi_IN"}"/>
<meta property="og:image" content="https://vedansh.app/images/og.png"/>
<meta property="og:image:alt" content="Vedansh — Bhagavad Gita, Panchang and japa"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escape(title)}"/>
<meta name="twitter:description" content="${escape(description)}"/>
<meta name="twitter:image" content="https://vedansh.app/images/og.png"/>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script>`;
}
