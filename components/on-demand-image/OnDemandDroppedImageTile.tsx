"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DroppedImagePreview } from "./hooks/useDroppedImagePreviews";

type OnDemandDroppedImageTileProps = {
  image: DroppedImagePreview;
  showRemove: boolean;
  onRemove: () => void;
  compact?: boolean;
};

export default function OnDemandDroppedImageTile({
  image,
  showRemove,
  onRemove,
  compact = false,
}: OnDemandDroppedImageTileProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 min-w-0 flex-col items-center gap-1",
        compact ? "h-full" : "h-full w-full justify-center gap-2",
      )}
    >
      {showRemove && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute top-1 right-1 z-10 h-6 w-6"
          onClick={onRemove}
          aria-label={`Remove ${image.fileName}`}
        >
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      )}
      {image.previewUrl ? (
        <img
          src={image.previewUrl}
          alt={image.fileName}
          className={cn(
            "max-w-full object-contain",
            compact ? "max-h-28 flex-1" : "max-h-full flex-1",
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground",
            compact ? "h-28 w-full" : "h-40 w-full",
          )}
        >
          Preview unavailable
        </div>
      )}
      <p className="w-full shrink-0 truncate text-center text-xs text-muted-foreground">
        {image.fileName}
      </p>
    </div>
  );
}
