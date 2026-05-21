"use client";

import { useCallback } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import useTauriStore from "@/lib/hooks/useTauriStore";
import { ON_DEMAND_SELECTED_TEMPLATE_INDEX_KEY } from "../constants/on-demand-template.constants";
import {
  ON_DEMAND_TEMPLATES_EXPORT_FILENAME,
  ON_DEMAND_TEMPLATES_JSON_FILTER,
} from "../constants/on-demand-template-import-export.constants";
import { useOnDemandImagesStore } from "../store/on-demand-images-store";
import { useOnDemandTemplatesStore } from "../store/on-demand-templates-store";
import { OnDemandTemplateList } from "../types/on-demand-template-list.type";
import { parseOnDemandTemplateList } from "../utils/parse-on-demand-template-list.utils";
import { persistOnDemandTemplates } from "../utils/persist-on-demand-templates";

export default function useOnDemandTemplateImportExport(
  setIsSaving: (value: boolean) => void
) {
  const templates = useOnDemandTemplatesStore((state) => state.templates);
  const saveTemplates = useOnDemandTemplatesStore(
    (state) => state.saveTemplates
  );
  const setSelectedTemplate = useOnDemandImagesStore(
    (state) => state.setSelectedTemplate
  );
  const { setValue } = useTauriStore();

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
    [saveTemplates, setIsSaving, setSelectedTemplate, setValue]
  );

  const exportTemplates = useCallback(async () => {
    if (templates.length === 0) {
      toast.error("No templates to export");
      return;
    }

    const filePath = await save({
      filters: [ON_DEMAND_TEMPLATES_JSON_FILTER],
      defaultPath: ON_DEMAND_TEMPLATES_EXPORT_FILENAME,
    });

    if (!filePath) {
      return;
    }

    setIsSaving(true);
    try {
      const payload: OnDemandTemplateList = { templates };
      await writeTextFile(filePath, JSON.stringify(payload, null, 2));
      toast.success("Templates exported");
    } catch (error) {
      console.error("Failed to export templates:", error);
      toast.error("Failed to export templates", {
        description: String(error),
      });
    } finally {
      setIsSaving(false);
    }
  }, [setIsSaving, templates]);

  const loadTemplates = useCallback(async () => {
    const filePath = await open({
      multiple: false,
      filters: [ON_DEMAND_TEMPLATES_JSON_FILTER],
    });

    if (!filePath || Array.isArray(filePath)) {
      return;
    }

    setIsSaving(true);
    try {
      const content = await readTextFile(filePath);
      let parsed: unknown;

      try {
        parsed = JSON.parse(content);
      } catch {
        toast.error("The selected file is not a valid templates file.");
        return;
      }

      const templateList = parseOnDemandTemplateList(parsed);
      if (!templateList) {
        toast.error("The selected file is not a valid templates file.");
        return;
      }

      if (templateList.templates.length === 0) {
        toast.error("The selected file does not contain any templates.");
        return;
      }

      await persistTemplates(templateList.templates, 0);
      toast.success("Templates loaded");
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Failed to load templates", {
        description: String(error),
      });
    } finally {
      setIsSaving(false);
    }
  }, [persistTemplates, setIsSaving]);

  return { exportTemplates, loadTemplates };
}
