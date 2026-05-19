"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import useOnDemandImageEvaluation from "./useOnDemandImageEvaluation";
import { useOnDemandImagesStore } from "../store/on-demand-images-store";

export default function useOnDemandManualEvaluation() {
  const { evaluateDroppedImages, isEvaluating } = useOnDemandImageEvaluation();
  const currentImagePaths = useOnDemandImagesStore(
    (state) => state.currentImagePaths,
  );
  const selectedTemplate = useOnDemandImagesStore(
    (state) => state.selectedTemplate,
  );

  const evaluateCurrentImages = useCallback(() => {
    if (!selectedTemplate) {
      toast.error("Select a template before evaluating");
      return;
    }

    if (currentImagePaths.length === 0) {
      toast.error("Drop at least one image before evaluating");
      return;
    }

    void evaluateDroppedImages(currentImagePaths, selectedTemplate);
  }, [currentImagePaths, evaluateDroppedImages, selectedTemplate]);

  const canEvaluate =
    selectedTemplate !== null && currentImagePaths.length > 0 && !isEvaluating;

  return { evaluateCurrentImages, canEvaluate, isEvaluating };
}
