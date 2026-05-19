"use client";

import { ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useOnDemandImageDrop from "./hooks/useOnDemandImageDrop";
import OnDemandDroppedImageTile from "./OnDemandDroppedImageTile";

const panelClassName =
  "flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-4 text-center";

export default function OnDemandDragAndDropField() {
  const {
    dropZoneRef,
    droppedImages,
    isDragOver,
    hasSelectedTemplate,
    isEvaluating,
    waitForManualEvalTrigger,
    removeDroppedImage,
  } = useOnDemandImageDrop();

  const hasImages = droppedImages.length > 0;
  const showRemoveButtons =
    waitForManualEvalTrigger && droppedImages.length > 1;
  const dropHint = waitForManualEvalTrigger
    ? "Drop more images to add"
    : "Drop image(s) to replace";

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
      {hasImages ? (
        <div className="flex h-full min-h-0 w-full flex-col gap-2">
          {droppedImages.length === 1 ? (
            <OnDemandDroppedImageTile
              image={droppedImages[0]}
              showRemove={showRemoveButtons}
              onRemove={() => removeDroppedImage(droppedImages[0].path)}
            />
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto">
              {droppedImages.map((image) => (
                <OnDemandDroppedImageTile
                  key={image.path}
                  image={image}
                  compact
                  showRemove={showRemoveButtons}
                  onRemove={() => removeDroppedImage(image.path)}
                />
              ))}
            </div>
          )}
          {isEvaluating ? (
            <p className="flex shrink-0 items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Evaluating...
            </p>
          ) : (
            <p className="shrink-0 text-xs text-muted-foreground">{dropHint}</p>
          )}
        </div>
      ) : (
        <div className="flex max-w-xs flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {hasSelectedTemplate
              ? "Drag and drop one or more images here"
              : "Select a template to use"}
          </p>
        </div>
      )}
    </div>
  );
}
