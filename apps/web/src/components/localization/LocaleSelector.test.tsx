import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocaleSelector } from "./LocaleSelector";

describe("LocaleSelector", () => {
  it("renders language label and supported options", () => {
    const handleChange = jest.fn();
    render(<LocaleSelector selectedLocale="en" onChange={handleChange} />);

    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByText(/english \(EN\)/i)).toBeInTheDocument();
    expect(screen.getByText(/हिन्दी \(HI\)/i)).toBeInTheDocument();
    expect(screen.getByText(/छत्तीसगढ़ी \(CHG\)/i)).toBeInTheDocument();
  });

  it("triggers onChange when user selects a different locale", () => {
    const handleChange = jest.fn();
    render(<LocaleSelector selectedLocale="en" onChange={handleChange} />);

    const select = screen.getByLabelText(/language/i);
    fireEvent.change(select, { target: { value: "hi" } });

    expect(handleChange).toHaveBeenCalledWith("hi");
  });

  it("supports disabled state", () => {
    render(<LocaleSelector selectedLocale="en" onChange={jest.fn()} disabled />);
    expect(screen.getByLabelText(/language/i)).toBeDisabled();
  });
});
