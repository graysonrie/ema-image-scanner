"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import getUtilServiceCommands from "@/lib/tauri/getUtilServiceCommands";
import { getFileName } from "../utils/on-demand-image-path.utils";

export type DroppedImagePreview = {
  path: string;
  fileName: string;
  previewUrl: string | null;
};

export default function useDroppedImagePreviews(
  imagePaths: string[],
  enabled: boolean,
) {
  const [previews, setPreviews] = useState<DroppedImagePreview[]>([]);

  useEffect(() => {
    if (!enabled || imagePaths.length === 0) {
      setPreviews([]);
      return;
    }

    setPreviews(
      imagePaths.map((path) => ({
        path,
        fileName: getFileName(path),
        previewUrl: null,
      })),
    );

    let cancelled = false;

    void Promise.all(
      imagePaths.map(async (path) => {
        try {
          const previewUrl =
            await getUtilServiceCommands().readImageFileAsDataUrl(path);
          return { path, fileName: getFileName(path), previewUrl };
        } catch (error) {
          console.error("Failed to load image preview:", error);
          return { path, fileName: getFileName(path), previewUrl: null };
        }
      }),
    ).then((results) => {
      if (cancelled) {
        return;
      }

      if (results.some((result) => result.previewUrl === null)) {
        toast.error("Failed to load one or more image previews");
      }

      setPreviews(results);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, imagePaths]);

  return previews;
}
