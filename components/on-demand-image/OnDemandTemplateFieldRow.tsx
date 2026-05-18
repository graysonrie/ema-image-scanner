"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnDemandTemplateField } from "./types/on-demand-template.type";

interface OnDemandTemplateFieldRowProps {
  field: OnDemandTemplateField;
  index: number;
  onChange: (updates: Partial<OnDemandTemplateField>) => void;
  onRemove: () => void;
}

export default function OnDemandTemplateFieldRow({
  field,
  index,
  onChange,
  onRemove,
}: OnDemandTemplateFieldRowProps) {
  return (
    <div className="space-y-1.5 rounded-md border border-border/70 bg-background/40 p-2">
      <div className="flex items-center gap-2">
        <Input
          id={`field-name-${index}`}
          value={field.fieldName}
          onChange={(event) => onChange({ fieldName: event.target.value })}
          placeholder="Field name"
          aria-label={`Field name ${index + 1}`}
          className="h-8 min-w-0 flex-1"
        />
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Checkbox
            checked={field.optional}
            onCheckedChange={(checked) =>
              onChange({
                optional: checked === "indeterminate" ? false : checked,
              })
            }
            className="size-3.5"
          />
          Optional
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          title="Delete field"
          aria-label="Delete field"
          className="h-7 w-7 shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1">
        <Label
          htmlFor={`field-description-${index}`}
          className="text-xs text-muted-foreground"
        >
          Instructions
        </Label>
        <Input
          id={`field-description-${index}`}
          value={field.description ?? ""}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Optional guidance for the OCR engine"
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
