import React from "react";
import { render, screen } from "@testing-library/react";
import { AccountEntry } from "../AccountEntry/AccountEntry";

describe("AccountEntry", () => {
  it("renders sign in link when unauthenticated", () => {
    render(<AccountEntry authenticated={false} />);
    const link = screen.getByRole("link", { name: "Sign in" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });

  it("renders account link when authenticated", () => {
    render(<AccountEntry authenticated={true} />);
    const link = screen.getByRole("link", { name: "Account profile" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
