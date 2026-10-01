import { render, screen, fireEvent } from "@testing-library/react";
import { SuccessState } from "../SuccessState";

describe("SuccessState component", () => {
  it("renders success title, message, and role='status'", () => {
    render(
      <SuccessState
        title="Homestay Booking Confirmed"
        message="Your host at Jagdalpur has confirmed your arrival date."
        actionText="View Reservation"
        onAction={jest.fn()}
      />
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Homestay Booking Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Your host at Jagdalpur has confirmed your arrival date.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Reservation" })).toBeInTheDocument();
  });

  it("handles action click event", () => {
    const handleAction = jest.fn();
    render(
      <SuccessState
        title="Trip Saved"
        actionText="Proceed to Map"
        onAction={handleAction}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Proceed to Map" }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
