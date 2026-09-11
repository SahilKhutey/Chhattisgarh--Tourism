import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DynamicEntryForm } from "../DynamicEntryForm";
import { RuntimeSchema } from "../../../types/content-entry";

describe("DynamicEntryForm", () => {
  const testSchema: RuntimeSchema = {
    template: {
      id: "tpl-1",
      slug: "destination",
      version: 1,
    },
    fields: [
      {
        key: "name",
        label: "Place Name",
        type: "TEXT",
        required: true,
        translatable: true,
        order: 1,
        group: "Basic Info",
        helpText: "Official name",
        config: {},
      },
      {
        key: "description",
        label: "Description",
        type: "TEXTAREA",
        required: false,
        translatable: true,
        order: 2,
        group: "Basic Info",
        helpText: null,
        config: {},
      },
      {
        key: "rating",
        label: "Star Rating",
        type: "NUMBER",
        required: false,
        translatable: false,
        order: 3,
        group: "Metrics",
        helpText: null,
        config: { min: 1, max: 5 },
      },
    ],
  };

  it("renders field groups and inputs from runtime schema", () => {
    const handleChange = jest.fn();
    const values = {
      name: "Chitrakote",
      description: "Horseshoe waterfall",
      rating: 5,
    };

    render(
      <DynamicEntryForm
        schema={testSchema}
        values={values}
        onChange={handleChange}
      />,
    );

    expect(screen.getByText("Basic Info")).toBeInTheDocument();
    expect(screen.getByText("Metrics")).toBeInTheDocument();

    expect(screen.getByLabelText(/Place Name/i)).toHaveValue("Chitrakote");
    expect(screen.getByLabelText(/Description/i)).toHaveValue("Horseshoe waterfall");
    expect(screen.getByLabelText(/Star Rating/i)).toHaveValue(5);
  });

  it("triggers onChange when a field value updates", () => {
    const handleChange = jest.fn();
    const values = {
      name: "Chitrakote",
    };

    render(
      <DynamicEntryForm
        schema={testSchema}
        values={values}
        onChange={handleChange}
      />,
    );

    const nameInput = screen.getByLabelText(/Place Name/i);
    fireEvent.change(nameInput, { target: { value: "Tirathgarh" } });

    expect(handleChange).toHaveBeenCalledWith({
      name: "Tirathgarh",
    });
  });
});
