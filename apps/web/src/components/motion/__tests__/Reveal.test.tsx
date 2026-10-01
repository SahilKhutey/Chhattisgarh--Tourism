import { render, screen } from "@testing-library/react";
import { Reveal } from "../Reveal";

describe("Reveal component", () => {
  beforeEach(() => {
    // Mock IntersectionObserver in jsdom
    class MockIntersectionObserver {
      observe = jest.fn();
      disconnect = jest.fn();
      unobserve = jest.fn();
    }
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  it("renders children without crashing", () => {
    render(
      <Reveal>
        <p>Kotumsar Cave Exploration</p>
      </Reveal>
    );

    expect(screen.getByText("Kotumsar Cave Exploration")).toBeInTheDocument();
  });
});
