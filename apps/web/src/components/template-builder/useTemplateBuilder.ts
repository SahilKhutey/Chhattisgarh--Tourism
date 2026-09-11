"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  ContentTemplate,
  TemplateField,
} from "@/types/template";

function normalizeFields(
  fields: TemplateField[],
): TemplateField[] {
  return fields.map(
    (field, index) => ({
      ...field,
      order: index,
    }),
  );
}

export function useTemplateBuilder(
  initialTemplate: ContentTemplate,
) {
  const [
    template,
    setTemplate,
  ] = useState<ContentTemplate>(
    () => ({
      ...initialTemplate,
      fields: normalizeFields(
        initialTemplate.fields ?? [],
      ),
    }),
  );

  const [
    dirty,
    setDirty,
  ] = useState(false);

  const updateTemplate = useCallback(
    (
      patch: Partial<ContentTemplate>,
    ) => {
      setTemplate(
        (current) => ({
          ...current,
          ...patch,
        }),
      );
      setDirty(true);
    },
    [],
  );

  const updateField = useCallback(
    (
      key: string,
      patch: Partial<TemplateField>,
    ) => {
      setTemplate(
        (current) => ({
          ...current,
          fields: current.fields.map(
            (field) =>
              field.key === key
                ? {
                    ...field,
                    ...patch,
                  }
                : field,
          ),
        }),
      );
      setDirty(true);
    },
    [],
  );

  const addField = useCallback(
    (field: TemplateField) => {
      setTemplate(
        (current) => ({
          ...current,
          fields: normalizeFields([
            ...current.fields,
            field,
          ]),
        }),
      );
      setDirty(true);
    },
    [],
  );

  const removeField = useCallback(
    (key: string) => {
      setTemplate(
        (current) => ({
          ...current,
          fields: normalizeFields(
            current.fields.filter(
              (field) =>
                field.key !== key,
            ),
          ),
        }),
      );
      setDirty(true);
    },
    [],
  );

  const reorderFields = useCallback(
    (
      oldIndex: number,
      newIndex: number,
    ) => {
      setTemplate(
        (current) => {
          const fields = [
            ...current.fields,
          ];
          const [
            moved,
          ] = fields.splice(
            oldIndex,
            1,
          );
          fields.splice(
            newIndex,
            0,
            moved,
          );
          return {
            ...current,
            fields:
              normalizeFields(
                fields,
              ),
          };
        },
      );
      setDirty(true);
    },
    [],
  );

  const markSaved = useCallback(
    () => setDirty(false),
    [],
  );

  const sortedFields =
    useMemo(
      () =>
        [...template.fields]
          .sort(
            (a, b) =>
              a.order - b.order,
          ),
      [template.fields],
    );

  return {
    template: {
      ...template,
      fields: sortedFields,
    },
    dirty,
    updateTemplate,
    updateField,
    addField,
    removeField,
    reorderFields,
    markSaved,
  };
}
