import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "../Toast";

describe("Toast component", () => {
  it("renders toast message and role='status' for normal notifications", () => {
    render(<Toast message="Itinerary saved successfully" type="success" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Itinerary saved successfully")).toBeInTheDocument();
  });

  it("renders role='alert' for error notifications", () => {
    render(<Toast message="Failed to load map layer" type="error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("handles dismissal callback", () => {
    const handleDismiss = jest.fn();
    render(
      <Toast
        message="Battery optimization active"
        onDismiss={handleDismiss}
      />
    );

    const dismissBtn = screen.getByRole("button", { name: "Dismiss notification" });
    fireEvent.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
