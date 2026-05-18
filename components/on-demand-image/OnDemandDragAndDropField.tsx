"use client";

import { ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useOnDemandImageDrop from "./hooks/useOnDemandImageDrop";

const panelClassName =
  "flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-4 text-center";

export default function OnDemandDragAndDropField() {
  const {
    dropZoneRef,
    previewUrl,
    fileName,
    isDragOver,
    hasSelectedTemplate,
    isEvaluating,
  } = useOnDemandImageDrop();

  return (
    <div
      ref={dropZoneRef}
      className={cn(
        panelClassName,
        "border-dashed transition-colors",
        isDragOver && "border-primary bg-primary/5",
        !hasSelectedTemplate && "opacity-60",
      )}
    >
      {previewUrl ? (
        <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-2">
          <img
            src={previewUrl}
            alt={fileName ?? "Dropped image"}
            className="max-h-full max-w-full flex-1 object-contain"
          />
          {fileName && (
            <p className="shrink-0 truncate text-xs text-muted-foreground">
              {fileName}
            </p>
          )}
          {isEvaluating ? (
            <p className="flex shrink-0 items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Evaluating...
            </p>
          ) : (
            <p className="shrink-0 text-xs text-muted-foreground">
              Drop another image to replace
            </p>
          )}
        </div>
      ) : (
        <div className="flex max-w-xs flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {hasSelectedTemplate
              ? "Drag and drop an image here to evaluate it"
              : "Select a template to use"}
          </p>
        </div>
      )}
    </div>
  );
}
