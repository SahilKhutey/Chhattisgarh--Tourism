import React from "react";
import { render } from "@testing-library/react";
import { StructuredData } from "../StructuredData";

describe("StructuredData", () => {
  it("renders script tag with TouristAttraction schema.org json-ld", () => {
    const { container } = render(
      <StructuredData
        name="Tirathgarh Falls"
        description="Spectacular waterfall in Kanger Valley"
        url="https://example.com/en/destinations/tirathgarh"
        image="https://images.example.com/tirath.jpg"
      />,
    );

    const script = container.querySelector("script[type='application/ld+json']");
    expect(script).not.toBeNull();

    const json = JSON.parse(script!.textContent || "{}");
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("TouristAttraction");
    expect(json["name"]).toBe("Tirathgarh Falls");
    expect(json["description"]).toBe("Spectacular waterfall in Kanger Valley");
    expect(json["image"]).toBe("https://images.example.com/tirath.jpg");
  });
});
