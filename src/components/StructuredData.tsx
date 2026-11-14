import { siteConfig } from "@/lib/content";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Mosque", "NGO"],
    name: siteConfig.masjidName,
    alternateName: siteConfig.organizationName,
    legalName: siteConfig.legalCharityName,
    url: siteConfig.domains.primary,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    taxID: siteConfig.revenueCharityTaxNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.city,
      postalCode: siteConfig.address.eircode,
      addressCountry: "IE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.coordinates.latitude,
      longitude: siteConfig.coordinates.longitude,
    },
    hasMap: "https://www.openstreetmap.org/?mlat=53.3850&mlon=-6.3860#map=16/53.3850/-6.3860",
    identifier: [
      { "@type": "PropertyValue", name: "Charities Regulator number", value: siteConfig.charitiesRegulatorNumber },
      { "@type": "PropertyValue", name: "Revenue charity tax number", value: siteConfig.revenueCharityTaxNumber },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
    />
  );
}
