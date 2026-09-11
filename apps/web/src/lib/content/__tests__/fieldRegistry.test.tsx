import React from "react";
import { render, screen } from "@testing-library/react";
import DOMPurify from "isomorphic-dompurify";
import { renderPublicField } from "../fieldRegistry";

describe("fieldRegistry & DOMPurify security", () => {
  it("sanitizes rich text against XSS attacks", () => {
    const dirty = '<img src=x onerror="alert(1)">';
    const clean = DOMPurify.sanitize(dirty);

    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("alert");
  });

  it("renders sanitized rich text through renderPublicField", () => {
    const dirtyField = {
      key: "body",
      label: "Body",
      type: "RICHTEXT" as const,
      value: '<p>Valid text</p><script>alert("hacked")</script>',
      group: "Content",
    };

    const { container } = render(<div>{renderPublicField(dirtyField)}</div>);
    expect(screen.getByText("Valid text")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });

  it("renders image with alt text", () => {
    const imgField = {
      key: "hero",
      label: "Hero",
      type: "IMAGE" as const,
      value: {
        url: "https://images.example.com/hero.jpg",
        alt_text: "Hero scenic view",
        caption: "A scenic sunrise",
      },
      group: "Media",
    };

    render(<div>{renderPublicField(imgField)}</div>);
    const img = screen.getByRole("img", { name: "Hero scenic view" });
    expect(img).toBeInTheDocument();
    expect(screen.getByText("A scenic sunrise")).toBeInTheDocument();
  });

  it("renders geo coordinates safely", () => {
    const geoField = {
      key: "loc",
      label: "Location",
      type: "GEO_POINT" as const,
      value: { latitude: 21.25, longitude: 81.63 },
      group: "Location",
    };

    render(<div>{renderPublicField(geoField)}</div>);
    expect(screen.getByText(/21.2500° N, 81.6300° E/)).toBeInTheDocument();
  });
});
