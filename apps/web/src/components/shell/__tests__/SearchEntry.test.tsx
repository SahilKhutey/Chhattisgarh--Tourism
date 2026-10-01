import React from "react";
import { render, screen } from "@testing-library/react";
import { SearchEntry } from "../SearchEntry/SearchEntry";

describe("SearchEntry", () => {
  it("renders accessible link to search page", () => {
    render(<SearchEntry />);
    const link = screen.getByRole("link", { name: "Search CG Tourism" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/search");
  });
});
