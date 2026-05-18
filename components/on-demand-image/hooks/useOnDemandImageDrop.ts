"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { toast } from "sonner";
import getUtilServiceCommands from "@/lib/tauri/getUtilServiceCommands";
import useOnDemandImageEvaluation from "./useOnDemandImageEvaluation";
import {
  useOnDemandImagesStore,
} from "../store/on-demand-images-store";
import { useOnDemandProgramOutputStore } from "../store/on-demand-program-output-store";

const IMAGE_PATH_PATTERN = /\.(jpe?g|png|gif|webp)$/i;

function isImagePath(path: string): boolean {
  return IMAGE_PATH_PATTERN.test(path);
}

function getFileName(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? path;
}

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
  const { evaluateDroppedImage, isEvaluating } = useOnDemandImageEvaluation();
  const clearOutput = useOnDemandProgramOutputStore((state) => state.clearOutput);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const setCurrentImagePath = useOnDemandImagesStore(
    (state) => state.setCurrentImagePath,
  );
  const currentImagePath = useOnDemandImagesStore(
    (state) => state.currentImagePath,
  );
  const selectedTemplate = useOnDemandImagesStore(
    (state) => state.selectedTemplate,
  );
  const hasSelectedTemplate = selectedTemplate !== null;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!hasSelectedTemplate) {
      setCurrentImagePath(null);
      setPreviewUrl(null);
      setIsDragOver(false);
      clearOutput();
    }
  }, [clearOutput, hasSelectedTemplate, setCurrentImagePath]);

  const loadPreview = useCallback(async (path: string) => {
    try {
      const dataUrl =
        await getUtilServiceCommands().readImageFileAsDataUrl(path);
      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error("Failed to load image preview:", error);
      setPreviewUrl(null);
      toast.error("Failed to load image preview", {
        description: String(error),
      });
    }
  }, []);

  const applyImagePath = useCallback(
    (path: string) => {
      const template = getSelectedTemplate();
      if (!template) {
        toast.error("Select a template before dropping an image");
        return;
      }

      if (!isImagePath(path)) {
        toast.error("Please drop an image file");
        return;
      }

      setCurrentImagePath(path);
      void loadPreview(path);
      void evaluateDroppedImage(path, template);
    },
    [evaluateDroppedImage, loadPreview, setCurrentImagePath],
  );

  const applyImagePathRef = useRef(applyImagePath);
  applyImagePathRef.current = applyImagePath;

  useEffect(() => {
    if (!currentImagePath) {
      setPreviewUrl(null);
      return;
    }

    if (isImagePath(currentImagePath)) {
      void loadPreview(currentImagePath);
    }
  }, [currentImagePath, loadPreview]);

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

        const imagePath = payload.paths.find(isImagePath);
        if (!imagePath) {
          toast.error("Please drop an image file");
          return;
        }

        applyImagePathRef.current(imagePath);
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, []);

  const fileName = currentImagePath ? getFileName(currentImagePath) : null;

  return {
    dropZoneRef,
    previewUrl: hasSelectedTemplate ? previewUrl : null,
    fileName: hasSelectedTemplate ? fileName : null,
    isDragOver,
    hasSelectedTemplate,
    isEvaluating,
  };
}
