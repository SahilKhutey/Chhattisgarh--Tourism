import React from "react";
import { render, screen } from "@testing-library/react";
import { ContentCard } from "../ContentCard";

describe("ContentCard", () => {
  it("renders card title, description, link, and image", () => {
    render(
      <ContentCard
        href="/en/destinations/sirpur"
        title="Sirpur Heritage Site"
        description="Ancient Buddhist monuments"
        image={{
          url: "https://images.example.com/sirpur.jpg",
          alt_text: "Sirpur temple structure",
        }}
      />,
    );

    expect(screen.getByText("Sirpur Heritage Site")).toBeInTheDocument();
    expect(screen.getByText("Ancient Buddhist monuments")).toBeInTheDocument();

    const img = screen.getByRole("img", { name: "Sirpur temple structure" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://images.example.com/sirpur.jpg");
  });
});
