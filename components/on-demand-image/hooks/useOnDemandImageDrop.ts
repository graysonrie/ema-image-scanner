"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { toast } from "sonner";
import useOnDemandImageEvaluation from "./useOnDemandImageEvaluation";
import useOnDemandImageSettings from "./useOnDemandImageSettings";
import useDroppedImagePreviews from "./useDroppedImagePreviews";
import { useOnDemandImagesStore } from "../store/on-demand-images-store";
import { useOnDemandProgramOutputStore } from "../store/on-demand-program-output-store";
import {
  isImagePath,
  mergeImagePaths,
} from "../utils/on-demand-image-path.utils";
``
function isPointInsideRect(
  x: number,
  y: number,
  rect: DOMRect,
): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function getSelectedTemplate() {
  return useOnDemandImagesStore.getState().selectedTemplate;
}

export default function useOnDemandImageDrop() {
  const { evaluateDroppedImages, isEvaluating } = useOnDemandImageEvaluation();
  const { waitForManualEvalTrigger } = useOnDemandImageSettings();
  const clearOutput = useOnDemandProgramOutputStore((state) => state.clearOutput);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const setCurrentImagePaths = useOnDemandImagesStore(
    (state) => state.setCurrentImagePaths,
  );
  const removeCurrentImagePath = useOnDemandImagesStore(
    (state) => state.removeCurrentImagePath,
  );
  const clearCurrentImagePaths = useOnDemandImagesStore(
    (state) => state.clearCurrentImagePaths,
  );
  const currentImagePaths = useOnDemandImagesStore(
    (state) => state.currentImagePaths,
  );
  const selectedTemplate = useOnDemandImagesStore(
    (state) => state.selectedTemplate,
  );
  const hasSelectedTemplate = selectedTemplate !== null;
  const [isDragOver, setIsDragOver] = useState(false);
  const droppedImages = useDroppedImagePreviews(
    currentImagePaths,
    hasSelectedTemplate,
  );

  useEffect(() => {
    if (!hasSelectedTemplate) {
      clearCurrentImagePaths();
      setIsDragOver(false);
      clearOutput();
    }
  }, [clearCurrentImagePaths, clearOutput, hasSelectedTemplate]);

  const applyImagePaths = useCallback(
    (incomingPaths: string[]) => {
      const template = getSelectedTemplate();
      if (!template) {
        toast.error("Select a template before dropping an image");
        return;
      }

      const imagePaths = incomingPaths.filter(isImagePath);
      if (imagePaths.length === 0) {
        toast.error("Please drop at least one image file");
        return;
      }

      const nextPaths = waitForManualEvalTrigger
        ? mergeImagePaths(
            useOnDemandImagesStore.getState().currentImagePaths,
            imagePaths,
          )
        : imagePaths;

      setCurrentImagePaths(nextPaths);

      if (!waitForManualEvalTrigger) {
        void evaluateDroppedImages(nextPaths, template);
      }
    },
    [
      evaluateDroppedImages,
      setCurrentImagePaths,
      waitForManualEvalTrigger,
    ],
  );

  const applyImagePathsRef = useRef(applyImagePaths);
  applyImagePathsRef.current = applyImagePaths;

  const removeDroppedImage = useCallback(
    (path: string) => {
      removeCurrentImagePath(path);
    },
    [removeCurrentImagePath],
  );

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) {
      return;
    }

    let unlisten: (() => void) | undefined;

    void getCurrentWebview()
      .onDragDropEvent((event) => {
        const { payload } = event;
        const rect = dropZone.getBoundingClientRect();

        if (payload.type === "over") {
          const isOverZone = isPointInsideRect(
            payload.position.x,
            payload.position.y,
            rect,
          );
          setIsDragOver(getSelectedTemplate() !== null && isOverZone);
          return;
        }

        if (payload.type === "leave") {
          setIsDragOver(false);
          return;
        }

        if (payload.type !== "drop") {
          return;
        }

        setIsDragOver(false);

        if (
          !isPointInsideRect(payload.position.x, payload.position.y, rect)
        ) {
          return;
        }

        if (!getSelectedTemplate()) {
          toast.error("Select a template before dropping an image");
          return;
        }

        applyImagePathsRef.current(payload.paths);
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, []);

  return {
    dropZoneRef,
    droppedImages: hasSelectedTemplate ? droppedImages : [],
    isDragOver,
    hasSelectedTemplate,
    isEvaluating,
    waitForManualEvalTrigger,
    removeDroppedImage,
  };
}
