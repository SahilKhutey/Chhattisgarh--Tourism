import React from "react";
import { render, screen } from "@testing-library/react";
import { EntryPreview } from "../EntryPreview";
import { RuntimeSchema } from "../../../types/content-entry";

describe("EntryPreview", () => {
  const testSchema: RuntimeSchema = {
    template: {
      id: "tpl-1",
      slug: "destination",
      version: 2,
    },
    fields: [
      {
        key: "name",
        label: "Place Name",
        type: "TEXT",
        required: true,
        translatable: true,
        order: 1,
        group: "Overview",
        helpText: null,
        config: {},
      },
      {
        key: "is_open",
        label: "Open To Public",
        type: "BOOLEAN",
        required: false,
        translatable: false,
        order: 2,
        group: "Overview",
        helpText: null,
        config: {},
      },
    ],
  };

  it("renders live preview of entry title and populated field values", () => {
    render(
      <EntryPreview
        title="Mainpat"
        slug="mainpat"
        schema={testSchema}
        values={{
          name: "Mainpat Hill Station",
          is_open: true,
        }}
      />,
    );

    expect(screen.getByText("Mainpat")).toBeInTheDocument();
    expect(screen.getByText("/mainpat")).toBeInTheDocument();
    expect(screen.getByText("Mainpat Hill Station")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
});
