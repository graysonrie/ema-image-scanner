"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OnDemandTemplateFieldRow from "./OnDemandTemplateFieldRow";
import { OnDemandTemplate } from "./types/on-demand-template.type";

interface OnDemandTemplateEditorProps {
  draft: OnDemandTemplate;
  onDraftChange: (draft: OnDemandTemplate) => void;
  onSave: () => void;
  canSave: boolean;
  isSaving: boolean;
}

export default function OnDemandTemplateEditor({
  draft,
  onDraftChange,
  onSave,
  canSave,
  isSaving,
}: OnDemandTemplateEditorProps) {
  const updateField = (
    index: number,
    updates: Partial<OnDemandTemplate["fields"][number]>,
  ) => {
    onDraftChange({
      ...draft,
      fields: draft.fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...updates } : field,
      ),
    });
  };

  const addField = () => {
    onDraftChange({
      ...draft,
      fields: [...draft.fields, { fieldName: "", optional: false }],
    });
  };

  const removeField = (index: number) => {
    onDraftChange({
      ...draft,
      fields: draft.fields.filter((_, fieldIndex) => fieldIndex !== index),
    });
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= draft.fields.length) {
      return;
    }

    const fields = [...draft.fields];
    [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];
    onDraftChange({ ...draft, fields });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <Label
            htmlFor="template-name"
            className="text-xs text-muted-foreground"
          >
            Name
          </Label>
          <Input
            id="template-name"
            value={draft.name}
            onChange={(event) =>
              onDraftChange({ ...draft, name: event.target.value })
            }
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs text-muted-foreground">Fields</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addField}
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add field
            </Button>
          </div>
          {draft.fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No fields yet. Add one to define what the template should extract.
            </p>
          ) : (
            <div className="space-y-1.5">
              {draft.fields.map((field, index) => (
                <OnDemandTemplateFieldRow
                  key={`field-${index}`}
                  field={field}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === draft.fields.length - 1}
                  onChange={(updates) => updateField(index, updates)}
                  onMoveUp={() => moveField(index, "up")}
                  onMoveDown={() => moveField(index, "down")}
                  onRemove={() => removeField(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={onSave}
        disabled={!canSave || isSaving}
        size="sm"
        className="shrink-0"
      >
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
