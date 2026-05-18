import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useTauriStore from "@/lib/hooks/useTauriStore";
import {
  DEFAULT_NEW_TEMPLATE_NAME,
  ON_DEMAND_SELECTED_TEMPLATE_INDEX_KEY,
} from "../constants/on-demand-template.constants";
import { useOnDemandImagesStore } from "../store/on-demand-images-store";
import { OnDemandTemplate } from "../types/on-demand-template.type";
import useOnDemandTemplatesLoader from "./useOnDemandTemplatesLoader";

function cloneTemplate(template: OnDemandTemplate): OnDemandTemplate {
  return {
    name: template.name,
    fields: template.fields.map((field) => ({ ...field })),
  };
}

function clampTemplateIndex(
  index: number | undefined,
  templateCount: number,
): number {
  if (templateCount === 0) {
    return 0;
  }

  if (typeof index !== "number" || index < 0) {
    return 0;
  }

  return Math.min(index, templateCount - 1);
}

export default function useOnDemandTemplateSelection() {
  const { templates, setTemplates, saveTemplates } = useOnDemandTemplatesLoader();
  const { getValue, setValue } = useTauriStore();
  const setSelectedTemplate = useOnDemandImagesStore(
    (state) => state.setSelectedTemplate,
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<OnDemandTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const persistSelectedIndex = useCallback(
    (index: number) => {
      void setValue(ON_DEMAND_SELECTED_TEMPLATE_INDEX_KEY, index);
    },
    [setValue],
  );

  const selectTemplateAt = useCallback(
    (index: number, nextTemplates = templates) => {
      const template = nextTemplates[index];
      if (!template) {
        return;
      }

      const cloned = cloneTemplate(template);
      setEditingIndex(index);
      setSelectedTemplate(cloned);
      setDraft(cloned);
      persistSelectedIndex(index);
    },
    [persistSelectedIndex, setSelectedTemplate, templates],
  );

  useEffect(() => {
    if (draft) {
      setSelectedTemplate(draft);
    }
  }, [draft, setSelectedTemplate]);

  useEffect(() => {
    if (templates.length === 0) {
      setEditingIndex(null);
      setDraft(null);
      setSelectedTemplate(null);
      return;
    }

    if (editingIndex !== null && templates[editingIndex]) {
      return;
    }

    let cancelled = false;

    const restoreSelection = async () => {
      const savedIndex = await getValue<number>(
        ON_DEMAND_SELECTED_TEMPLATE_INDEX_KEY,
      );
      if (cancelled) {
        return;
      }

      const index = clampTemplateIndex(savedIndex, templates.length);
      selectTemplateAt(index);
    };

    void restoreSelection();

    return () => {
      cancelled = true;
    };
  }, [editingIndex, getValue, selectTemplateAt, setSelectedTemplate, templates]);

  const handleCreateTemplate = () => {
    const newTemplate: OnDemandTemplate = {
      name: DEFAULT_NEW_TEMPLATE_NAME,
      fields: [],
    };
    const nextTemplates = [...templates, newTemplate];
    setTemplates(nextTemplates);
    selectTemplateAt(nextTemplates.length - 1, nextTemplates);
  };

  const canSave =
    !!draft &&
    draft.name.trim() !== DEFAULT_NEW_TEMPLATE_NAME &&
    draft.fields.every((field) => field.fieldName.trim().length > 0);

  const handleSave = async () => {
    if (!draft || editingIndex === null || !canSave) {
      return;
    }

    setIsSaving(true);
    try {
      const nextTemplates = templates.map((template, index) =>
        index === editingIndex
          ? {
              name: draft.name.trim(),
              fields: draft.fields.map((field) => {
                const description = field.description?.trim();
                return {
                  fieldName: field.fieldName.trim(),
                  optional: field.optional,
                  ...(description ? { description } : {}),
                };
              }),
            }
          : template,
      );
      await saveTemplates(nextTemplates);
      setSelectedTemplate(nextTemplates[editingIndex]);
      setDraft(cloneTemplate(nextTemplates[editingIndex]));
      persistSelectedIndex(editingIndex);
      toast.success("Template saved");
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template", {
        description: String(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    templates,
    draft,
    setDraft,
    canSave,
    isSaving,
    selectTemplateAt,
    handleCreateTemplate,
    handleSave,
  };
}
