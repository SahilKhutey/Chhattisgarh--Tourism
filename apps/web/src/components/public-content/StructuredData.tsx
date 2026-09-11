import React from "react";

interface Props {
  name: string;
  description?: string | null;
  url: string;
  image?: string;
}

export function StructuredData({
  name,
  description,
  url,
  image,
}: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name,
    description: description ?? undefined,
    url,
    ...(image ? { image } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
