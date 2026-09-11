/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FieldPalette } from "../FieldPalette";

describe("FieldPalette Component", () => {
  it("renders all 18 field types with accessible buttons", () => {
    const handleAdd = jest.fn();
    render(<FieldPalette onAdd={handleAdd} />);

    expect(screen.getByLabelText("Template field palette")).toBeInTheDocument();
    expect(screen.getByText("Fields")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(18);

    fireEvent.click(screen.getByRole("button", { name: "+ Text" }));
    expect(handleAdd).toHaveBeenCalledWith("TEXT");

    fireEvent.click(screen.getByRole("button", { name: "+ Geo Point" }));
    expect(handleAdd).toHaveBeenCalledWith("GEO_POINT");

    fireEvent.click(screen.getByRole("button", { name: "+ Image" }));
    expect(handleAdd).toHaveBeenCalledWith("IMAGE");
  });
});
