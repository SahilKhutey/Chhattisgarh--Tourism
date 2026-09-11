/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FieldEditor } from "../FieldEditor";
import type { TemplateField } from "@/types/template";

describe("FieldEditor Component", () => {
  const baseField: TemplateField = {
    key: "hero_title",
    label: "Hero Title",
    type: "TEXT",
    required: false,
    translatable: true,
    order: 0,
    group: "Basic Info",
    helpText: "Enter the primary title",
    config: {},
  };

  it("renders field details and triggers onChange and onRemove", () => {
    const handleChange = jest.fn();
    const handleRemove = jest.fn();

    render(
      <FieldEditor
        field={baseField}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(screen.getByText("Hero Title")).toBeInTheDocument();
    expect(screen.getByText("TEXT")).toBeInTheDocument();

    const keyInput = screen.getByDisplayValue("hero_title");
    fireEvent.change(keyInput, { target: { value: "hero_heading" } });
    expect(handleChange).toHaveBeenCalledWith({ key: "hero_heading" });

    const labelInput = screen.getByDisplayValue("Hero Title");
    fireEvent.change(labelInput, { target: { value: "Banner Title" } });
    expect(handleChange).toHaveBeenCalledWith({ label: "Banner Title" });

    const removeBtn = screen.getByRole("button", { name: "Remove Hero Title" });
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalled();
  });

  it("enforces alt text requirement display for image fields", () => {
    const imageField: TemplateField = {
      ...baseField,
      key: "hero_image",
      label: "Hero Image",
      type: "IMAGE",
      config: { require_alt_text: true },
    };

    render(
      <FieldEditor
        field={imageField}
        onChange={jest.fn()}
        onRemove={jest.fn()}
      />,
    );

    const altTextCheckbox = screen.getByLabelText("Alt text required");
    expect(altTextCheckbox).toBeInTheDocument();
    expect(altTextCheckbox).toBeChecked();
    expect(altTextCheckbox).toBeDisabled();
  });

  it("handles dropdown options with pipe format", () => {
    const dropdownField: TemplateField = {
      ...baseField,
      key: "category",
      label: "Category",
      type: "DROPDOWN",
      config: {
        options: [
          { value: "nature", label: "Nature" },
          { value: "heritage", label: "Heritage" },
        ],
      },
    };

    const handleChange = jest.fn();

    render(
      <FieldEditor
        field={dropdownField}
        onChange={handleChange}
        onRemove={jest.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText(/heritage\|Heritage/i);
    expect(textarea).toHaveValue("nature|Nature\nheritage|Heritage");

    fireEvent.change(textarea, {
      target: { value: "nature|Nature\nheritage|Heritage\ncraft|Tribal Craft" },
    });

    expect(handleChange).toHaveBeenCalledWith({
      config: {
        options: [
          { value: "nature", label: "Nature" },
          { value: "heritage", label: "Heritage" },
          { value: "craft", label: "Tribal Craft" },
        ],
      },
    });
  });

  it("handles relation target slug configuration", () => {
    const relationField: TemplateField = {
      ...baseField,
      key: "nearby_places",
      label: "Nearby Places",
      type: "RELATION",
      config: {},
    };

    const handleChange = jest.fn();

    render(
      <FieldEditor
        field={relationField}
        onChange={handleChange}
        onRemove={jest.fn()}
      />,
    );

    const relationInput = screen.getByPlaceholderText("destination");
    fireEvent.change(relationInput, { target: { value: "place" } });
    expect(handleChange).toHaveBeenCalledWith({
      config: { relation_template_slug: "place" },
    });
  });
});
