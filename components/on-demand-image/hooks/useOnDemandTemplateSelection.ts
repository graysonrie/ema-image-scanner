import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_NEW_TEMPLATE_NAME } from "../constants/on-demand-template.constants";
import { useOnDemandImagesStore } from "../store/on-demand-images-store";
import { OnDemandTemplate } from "../types/on-demand-template.type";
import useOnDemandTemplatesLoader from "./useOnDemandTemplatesLoader";

function cloneTemplate(template: OnDemandTemplate): OnDemandTemplate {
  return {
    name: template.name,
    fields: template.fields.map((field) => ({ ...field })),
  };
}

export default function useOnDemandTemplateSelection() {
  const { templates, setTemplates, saveTemplates } = useOnDemandTemplatesLoader();
  const setSelectedTemplate = useOnDemandImagesStore(
    (state) => state.setSelectedTemplate,
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<OnDemandTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectTemplateAt = useCallback(
    (index: number, nextTemplates = templates) => {
      const template = nextTemplates[index];
      if (!template) {
        return;
      }

      setEditingIndex(index);
      setSelectedTemplate(template);
      setDraft(cloneTemplate(template));
    },
    [setSelectedTemplate, templates],
  );

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

    selectTemplateAt(0);
  }, [editingIndex, selectTemplateAt, setSelectedTemplate, templates]);

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
              fields: draft.fields.map((field) => ({
                fieldName: field.fieldName.trim(),
                optional: field.optional,
              })),
            }
          : template,
      );
      await saveTemplates(nextTemplates);
      setSelectedTemplate(nextTemplates[editingIndex]);
      setDraft(cloneTemplate(nextTemplates[editingIndex]));
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
