"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import useTauriStore from "@/lib/hooks/useTauriStore";
import getOnDemandImagesServiceCommands from "@/lib/tauri/getOnDemandImagesServiceCommands";
import getUtilServiceCommands from "@/lib/tauri/getUtilServiceCommands";
import { ON_DEMAND_COPY_TO_SYSTEM_CLIPBOARD_STORAGE_KEY } from "../constants/on-demand-template.constants";
import { useOnDemandProgramOutputStore } from "../store/on-demand-program-output-store";
import { OnDemandTemplate } from "../types/on-demand-template.type";

export default function useOnDemandImageEvaluation() {
  const { getValue } = useTauriStore();
  const setOutput = useOnDemandProgramOutputStore((state) => state.setOutput);
  const setIsEvaluating = useOnDemandProgramOutputStore(
    (state) => state.setIsEvaluating
  );
  const isEvaluating = useOnDemandProgramOutputStore(
    (state) => state.isEvaluating
  );

  const evaluateDroppedImages = useCallback(
    async (imagePaths: string[], template: OnDemandTemplate) => {
      const openaiApiKey = await getValue<string>("openAIApiKey");
      if (!openaiApiKey?.trim()) {
        toast.error("Set your OpenAI API key in App Settings first");
        return;
      }

      setIsEvaluating(true);
      setOutput("");

      try {
        const result =
          await getOnDemandImagesServiceCommands().evaluateSelectedImageOnDemand(
            imagePaths,
            template,
            openaiApiKey
          );

        setOutput(result);

        const autoCopy = await getValue<boolean>(
          ON_DEMAND_COPY_TO_SYSTEM_CLIPBOARD_STORAGE_KEY
        );
        if (autoCopy ?? true) {
          await getUtilServiceCommands().copyToClipboard(result);
        }
      } catch (error) {
        console.error("Failed to evaluate image:", error);
        setOutput("");
        toast.error("Failed to evaluate image", {
          description: String(error),
        });
      } finally {
        setIsEvaluating(false);
      }
    },
    [getValue, setIsEvaluating, setOutput]
  );

  return { evaluateDroppedImages, isEvaluating };
}
