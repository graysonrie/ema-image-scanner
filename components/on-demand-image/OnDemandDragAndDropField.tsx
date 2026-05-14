import { ImageIcon } from "lucide-react";

const panelClassName =
  "flex h-full min-h-0 w-full flex-col items-center justify-center rounded-lg border border-border bg-card p-6 text-center";

export default function OnDemandDragAndDropField() {
  return (
    <div className={`${panelClassName} border-dashed`}>
      <div className="flex max-w-xs flex-col items-center gap-2">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop an image here to evaluate it
        </p>
      </div>
    </div>
  );
}
