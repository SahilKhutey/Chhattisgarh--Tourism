import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DynamicEntryField } from "../DynamicEntryField";
import { RuntimeField } from "../../../types/content-entry";

describe("DynamicEntryField", () => {
  it("renders dynamic text field with label, value, and change handler", () => {
    const field: RuntimeField = {
      key: "name",
      label: "Destination Name",
      type: "TEXT",
      required: true,
      translatable: true,
      order: 1,
      group: "General",
      helpText: "Enter the official tourism spot name.",
      config: {},
    };

    const handleChange = jest.fn();

    render(
      <DynamicEntryField
        field={field}
        value="Barnawapara"
        onChange={handleChange}
      />,
    );

    const input = screen.getByLabelText(/Destination Name/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Barnawapara");
    expect(screen.getByText("Enter the official tourism spot name.")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Barnawapara Wildlife" } });
    expect(handleChange).toHaveBeenCalledWith("Barnawapara Wildlife");
  });

  it("renders number field and parses numeric value", () => {
    const field: RuntimeField = {
      key: "entry_fee",
      label: "Entry Fee",
      type: "NUMBER",
      required: false,
      translatable: false,
      order: 2,
      group: "Details",
      helpText: null,
      config: { min: 0, max: 1000 },
    };

    const handleChange = jest.fn();

    render(
      <DynamicEntryField
        field={field}
        value={50}
        onChange={handleChange}
      />,
    );

    const input = screen.getByLabelText(/Entry Fee/i);
    expect(input).toHaveValue(50);

    fireEvent.change(input, { target: { value: "75" } });
    expect(handleChange).toHaveBeenCalledWith(75);
  });

  it("renders boolean checkbox", () => {
    const field: RuntimeField = {
      key: "is_active",
      label: "Is Active",
      type: "BOOLEAN",
      required: false,
      translatable: false,
      order: 3,
      group: "Details",
      helpText: null,
      config: {},
    };

    const handleChange = jest.fn();

    render(
      <DynamicEntryField
        field={field}
        value={true}
        onChange={handleChange}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("renders dropdown select with options", () => {
    const field: RuntimeField = {
      key: "category",
      label: "Category",
      type: "DROPDOWN",
      required: true,
      translatable: false,
      order: 4,
      group: "Details",
      helpText: null,
      config: {
        options: [
          { label: "Wildlife", value: "wildlife" },
          { label: "Waterfalls", value: "waterfalls" },
        ],
      },
    };

    const handleChange = jest.fn();

    render(
      <DynamicEntryField
        field={field}
        value="wildlife"
        onChange={handleChange}
      />,
    );

    const select = screen.getByLabelText(/Category/i);
    expect(select).toHaveValue("wildlife");

    fireEvent.change(select, { target: { value: "waterfalls" } });
    expect(handleChange).toHaveBeenCalledWith("waterfalls");
  });
});
