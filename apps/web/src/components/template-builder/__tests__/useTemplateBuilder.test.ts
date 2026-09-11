/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useTemplateBuilder } from "../useTemplateBuilder";
import { createField } from "../fieldFactory";
import type { ContentTemplate } from "@/types/template";

describe("useTemplateBuilder hook", () => {
  const mockTemplate: ContentTemplate = {
    id: "tpl-123",
    name: "Destination Template",
    slug: "destination-template",
    description: "Sample template",
    icon: "map",
    category: "destination",
    status: "DRAFT",
    fields: [
      {
        key: "first",
        label: "First Field",
        type: "TEXT",
        required: true,
        translatable: true,
        order: 0,
        group: null,
        helpText: null,
        config: {},
      },
      {
        key: "second",
        label: "Second Field",
        type: "NUMBER",
        required: false,
        translatable: false,
        order: 1,
        group: null,
        helpText: null,
        config: {},
      },
      {
        key: "third",
        label: "Third Field",
        type: "TEXTAREA",
        required: false,
        translatable: true,
        order: 2,
        group: null,
        helpText: null,
        config: {},
      },
    ],
    updated_at: new Date().toISOString(),
  };

  it("initializes with sorted and normalized fields and dirty = false", () => {
    const { result } = renderHook(() => useTemplateBuilder(mockTemplate));
    expect(result.current.dirty).toBe(false);
    expect(result.current.template.fields).toHaveLength(3);
    expect(result.current.template.fields[0].key).toBe("first");
    expect(result.current.template.fields[1].key).toBe("second");
    expect(result.current.template.fields[2].key).toBe("third");
  });

  it("marks builder dirty after adding a field", () => {
    const { result } = renderHook(() => useTemplateBuilder(mockTemplate));
    expect(result.current.dirty).toBe(false);

    act(() => {
      result.current.addField(createField("IMAGE", ["first", "second", "third"]));
    });

    expect(result.current.dirty).toBe(true);
    expect(result.current.template.fields).toHaveLength(4);
    expect(result.current.template.fields[3].key).toBe("image");
    expect(result.current.template.fields[3].order).toBe(3);
  });

  it("updates field attributes and marks dirty", () => {
    const { result } = renderHook(() => useTemplateBuilder(mockTemplate));

    act(() => {
      result.current.updateField("first", { label: "Updated First Name" });
    });

    expect(result.current.dirty).toBe(true);
    expect(result.current.template.fields[0].label).toBe("Updated First Name");
  });

  it("reorders fields and normalizes order indices", () => {
    const { result } = renderHook(() => useTemplateBuilder(mockTemplate));

    act(() => {
      // Move field at index 0 ('first') to index 2
      result.current.reorderFields(0, 2);
    });

    expect(result.current.dirty).toBe(true);
    expect(result.current.template.fields[0].key).toBe("second");
    expect(result.current.template.fields[0].order).toBe(0);
    expect(result.current.template.fields[1].key).toBe("third");
    expect(result.current.template.fields[1].order).toBe(1);
    expect(result.current.template.fields[2].key).toBe("first");
    expect(result.current.template.fields[2].order).toBe(2);
  });

  it("removes a field and re-normalizes order indices", () => {
    const { result } = renderHook(() => useTemplateBuilder(mockTemplate));

    act(() => {
      result.current.removeField("second");
    });

    expect(result.current.dirty).toBe(true);
    expect(result.current.template.fields).toHaveLength(2);
    expect(result.current.template.fields.some((f) => f.key === "second")).toBe(false);
    expect(result.current.template.fields[0].key).toBe("first");
    expect(result.current.template.fields[0].order).toBe(0);
    expect(result.current.template.fields[1].key).toBe("third");
    expect(result.current.template.fields[1].order).toBe(1);
  });

  it("resets dirty state when markSaved is called", () => {
    const { result } = renderHook(() => useTemplateBuilder(mockTemplate));

    act(() => {
      result.current.updateTemplate({ name: "New Name" });
    });
    expect(result.current.dirty).toBe(true);

    act(() => {
      result.current.markSaved();
    });
    expect(result.current.dirty).toBe(false);
  });
});
