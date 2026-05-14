import { useCallback } from "react";
import { toast } from "sonner";
import getTauriCommands from "@/lib/hooks/getTauriCommands";
import { useProjectStore } from "@/lib/stores/projectStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";

export default function useImageEvaluation() {
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const customPrompt = useSettingsStore((s) => s.customPrompt);
  const customTemperature = useSettingsStore((s) => s.customTemperature);
  const imagePreviews = useProjectStore((s) => s.imagePreviews);
  const selectedImage = useProjectStore((s) => s.selectedImage);
  const imageEvaluations = useProjectStore((s) => s.imageEvaluations);
  const setImageEvaluations = useProjectStore((s) => s.setImageEvaluations);
  const setIsEvaluating = useProjectStore((s) => s.setIsEvaluating);
  const setEvaluatingImageNames = useProjectStore(
    (s) => s.setEvaluatingImageNames
  );

  const evaluateImagesByNames = useCallback(
    async (openAIApiKey: string, imageNames: string[]) => {
      if (!activeProjectName || imageNames.length === 0) return;

      setIsEvaluating(true);
      setEvaluatingImageNames(imageNames);
      try {
        const { evaluateImages } = getTauriCommands();
        const evaluations = await evaluateImages(
          activeProjectName,
          {
            openaiApiKey: openAIApiKey,
            imageNames,
          },
          customPrompt,
          customTemperature
        );
        setImageEvaluations(evaluations);
        const count = imageNames.length;
        toast.success(
          count === 1
            ? "Image evaluated successfully"
            : `${count} images evaluated successfully`
        );
      } catch (error) {
        console.error("Failed to evaluate images:", error);
        toast.error("Failed to evaluate images", {
          description: String(error),
        });
      } finally {
        setIsEvaluating(false);
        setEvaluatingImageNames([]);
      }
    },
    [
      activeProjectName,
      customPrompt,
      customTemperature,
      setImageEvaluations,
      setIsEvaluating,
      setEvaluatingImageNames,
    ]
  );

  const evaluateSelectedImage = useCallback(
    async (openAIApiKey: string) => {
      if (!selectedImage) return;
      await evaluateImagesByNames(openAIApiKey, [selectedImage.imageName]);
    },
    [selectedImage, evaluateImagesByNames]
  );

  const evaluateNewImages = useCallback(
    async (openAIApiKey: string) => {
      if (!activeProjectName) return;
      const evaluatedNames = imageEvaluations.map((e) => e.imageName);
      const toEval = imagePreviews
        .filter((p) => !evaluatedNames.includes(p.imageName))
        .map((p) => p.imageName);
      if (toEval.length === 0) {
        toast.info("No unevaluated images");
        return;
      }
      await evaluateImagesByNames(openAIApiKey, toEval);
    },
    [activeProjectName, imagePreviews, imageEvaluations, evaluateImagesByNames]
  );

  const reevaluateAll = useCallback(
    async (openAIApiKey: string) => {
      if (!activeProjectName) return;
      const toEval = imagePreviews.map((p) => p.imageName);
      if (toEval.length === 0) {
        toast.info("No images in project");
        return;
      }
      await evaluateImagesByNames(openAIApiKey, toEval);
    },
    [activeProjectName, imagePreviews, evaluateImagesByNames]
  );

  const evaluateNewImagesInFolder = useCallback(
    async (openAIApiKey: string, folder: string) => {
      if (!activeProjectName) return;
      const folderPreviews = imagePreviews.filter((p) =>
        p.imageName.startsWith(`${folder}/`)
      );
      const evaluatedNames = imageEvaluations.map((e) => e.imageName);
      const toEval = folderPreviews
        .filter((p) => !evaluatedNames.includes(p.imageName))
        .map((p) => p.imageName);
      if (toEval.length === 0) {
        toast.info("No unevaluated images in folder");
        return;
      }
      await evaluateImagesByNames(openAIApiKey, toEval);
    },
    [activeProjectName, imagePreviews, imageEvaluations, evaluateImagesByNames]
  );

  const reevaluateAllInFolder = useCallback(
    async (openAIApiKey: string, folder: string) => {
      if (!activeProjectName) return;
      const toEval = imagePreviews
        .filter((p) => p.imageName.startsWith(`${folder}/`))
        .map((p) => p.imageName);
      if (toEval.length === 0) {
        toast.info("No images in folder");
        return;
      }
      await evaluateImagesByNames(openAIApiKey, toEval);
    },
    [activeProjectName, imagePreviews, evaluateImagesByNames]
  );

  return {
    evaluateSelectedImage,
    evaluateNewImages,
    evaluateNewImagesInFolder,
    reevaluateAll,
    reevaluateAllInFolder,
  };
}
