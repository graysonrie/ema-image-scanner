import { Field, FieldLabel, FieldDescription } from "../ui/field";
import { ImageIcon } from "lucide-react";

export default function OnDemandDragAndDropField() {
  return (
    <div className="flex flex-col gap-2 border-2 border-dashed border-gray-300 rounded-md p-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        <p className="text-sm text-muted-foreground">
          Drag and drop images here to evaluate them
        </p>
      </div>
    </div>
  );
}
