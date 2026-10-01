import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../Header/Header";
import { DesktopHeader } from "../Header/DesktopHeader";
import { MobileHeader } from "../Header/MobileHeader";

describe("Header Components", () => {
  describe("DesktopHeader", () => {
    it("renders desktop navigation and brand link", () => {
      render(<DesktopHeader />);
      expect(screen.getByRole("link", { name: "CG Tourism home" })).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    });
  });

  describe("MobileHeader", () => {
    it("manages mobile drawer open and close state with accessible attributes", () => {
      render(<MobileHeader />);

      const toggleBtn = screen.getByRole("button", { name: "Open navigation" });
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
      expect(toggleBtn).toHaveAttribute("aria-controls", "mobile-navigation");

      // Open drawer
      fireEvent.click(toggleBtn);
      expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("dialog", { name: "Mobile Navigation Menu" })).toBeInTheDocument();

      // Close drawer with close button
      const closeBtn = screen.getByRole("button", { name: "Close navigation menu" });
      fireEvent.click(closeBtn);
      expect(screen.queryByRole("dialog", { name: "Mobile Navigation Menu" })).not.toBeInTheDocument();
    });

    it("closes drawer on Escape key press", () => {
      render(<MobileHeader />);
      const toggleBtn = screen.getByRole("button", { name: "Open navigation" });
      fireEvent.click(toggleBtn);
      expect(screen.getByRole("dialog", { name: "Mobile Navigation Menu" })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("dialog", { name: "Mobile Navigation Menu" })).not.toBeInTheDocument();
    });
  });

  describe("Composite Header", () => {
    it("renders composite header landmarks", () => {
      render(<Header />);
      const banners = screen.getAllByRole("banner");
      expect(banners.length).toBeGreaterThanOrEqual(1);
    });
  });
});
