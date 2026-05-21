"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import useTauriStore from "@/lib/hooks/useTauriStore";
import { ON_DEMAND_SELECTED_TEMPLATE_INDEX_KEY } from "../constants/on-demand-template.constants";
import { useOnDemandImagesStore } from "../store/on-demand-images-store";
import { useOnDemandTemplatesStore } from "../store/on-demand-templates-store";
import { persistOnDemandTemplates } from "../utils/persist-on-demand-templates";
import {
  clampTemplateIndex,
  selectedIndexAfterDelete,
  selectedIndexAfterMove,
} from "../utils/on-demand-template-selection.utils";
import useOnDemandTemplateImportExport from "./useOnDemandTemplateImportExport";

export default function useOnDemandTemplateReorder() {
  const templates = useOnDemandTemplatesStore((state) => state.templates);
  const saveTemplates = useOnDemandTemplatesStore((state) => state.saveTemplates);
  const setSelectedTemplate = useOnDemandImagesStore(
    (state) => state.setSelectedTemplate,
  );
  const { getValue, setValue } = useTauriStore();
  const [isSaving, setIsSaving] = useState(false);
  const { exportTemplates, loadTemplates } =
    useOnDemandTemplateImportExport(setIsSaving);

  const persistTemplates = useCallback(
    async (nextTemplates: typeof templates, nextSelectedIndex: number) => {
      setIsSaving(true);
      try {
        await persistOnDemandTemplates(nextTemplates, nextSelectedIndex, {
          saveTemplates,
          setSelectedIndex: (index) =>
            setValue(ON_DEMAND_SELECTED_TEMPLATE_INDEX_KEY, index),
          setSelectedTemplate,
        });
      } catch (error) {
        console.error("Failed to update templates:", error);
        toast.error("Failed to update templates", {
          description: String(error),
        });
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [saveTemplates, setSelectedTemplate, setValue],
  );

  const moveTemplate = useCallback(
    async (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= templates.length) {
        return;
      }

      const nextTemplates = [...templates];
      [nextTemplates[index], nextTemplates[targetIndex]] = [
        nextTemplates[targetIndex],
        nextTemplates[index],
      ];

      const savedIndex = await getValue<number>(
        ON_DEMAND_SELECTED_TEMPLATE_INDEX_KEY,
      );
      const currentIndex = clampTemplateIndex(savedIndex, templates.length);
      const nextSelectedIndex = selectedIndexAfterMove(
        currentIndex,
        index,
        targetIndex,
      );

      await persistTemplates(nextTemplates, nextSelectedIndex);
    },
    [getValue, persistTemplates, templates],
  );

  const deleteTemplate = useCallback(
    async (index: number) => {
      if (templates.length <= 1) {
        return;
      }

      const nextTemplates = templates.filter((_, i) => i !== index);
      const savedIndex = await getValue<number>(
        ON_DEMAND_SELECTED_TEMPLATE_INDEX_KEY,
      );
      const currentIndex = clampTemplateIndex(savedIndex, templates.length);
      const nextSelectedIndex = selectedIndexAfterDelete(
        currentIndex,
        index,
        nextTemplates.length,
      );

      await persistTemplates(nextTemplates, nextSelectedIndex);
      toast.success("Template deleted");
    },
    [getValue, persistTemplates, templates],
  );

  return {
    templates,
    isSaving,
    moveTemplate,
    deleteTemplate,
    exportTemplates,
    loadTemplates,
  };
}
