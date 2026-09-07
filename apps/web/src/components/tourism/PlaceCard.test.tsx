/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PlaceCard } from "./PlaceCard";
import type { Place } from "@/data/api/types";

jest.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

const mockPlace: Place = {
  id: "place-001",
  slug: "chitrakot-falls",
  name: "Chitrakot Falls",
  description: "India\'s widest waterfall.",
  latitude: 18.87,
  longitude: 81.93,
  district: { id: "d-1", name: "Bastar", slug: "bastar" },
  category: { id: "c-1", name: "Waterfalls", slug: "waterfalls" },
  imageUrl: "https://example.com/photo.jpg",
  verified: true,
  rating: 4.8,
  durationMinutes: 120,
};

describe("PlaceCard", () => {
  it("renders the place name", () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText("Chitrakot Falls")).toBeInTheDocument();
  });

  it("renders a link to /destinations/<slug>", () => {
    render(<PlaceCard place={mockPlace} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/destinations/chitrakot-falls");
  });

  it("shows the district name", () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText("Bastar")).toBeInTheDocument();
  });

  it("shows the rating", () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("shows the hero image", () => {
    render(<PlaceCard place={mockPlace} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
    expect(img).toHaveAttribute("alt", "Chitrakot Falls");
  });

  it("shows Verified badge when place is verified", () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("does not show Verified badge when place is not verified", () => {
    render(<PlaceCard place={{ ...mockPlace, verified: false }} />);
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
  });

  it("renders fallback text when no imageUrl", () => {
    render(<PlaceCard place={{ ...mockPlace, imageUrl: null, heroImage: null }} />);
    expect(screen.getByLabelText("Image unavailable")).toBeInTheDocument();
  });

  it("shows duration in minutes", () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText("120 min")).toBeInTheDocument();
  });
});
