import HomeClient from "@/components/HomeClient";
import { BRAND } from "@/lib/brand";
import { HOME_FAQS } from "@/lib/faq";
import { getLiveDisplayModels } from "@/lib/openrouter-catalog";

export const revalidate = 1800;

export default async function HomePage() {
  const models = await getLiveDisplayModels();

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND.fullName,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web, Linux, macOS, Windows",
    url: BRAND.siteUrl,
    description: BRAND.description,
    inLanguage: "id-ID",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: "10000",
      highPrice: "500000",
      offerCount: "4",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient models={models} faqs={HOME_FAQS} />
    </>
  );
}
