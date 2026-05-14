"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                <div
                  key={`field-${index}`}
                  className="flex items-center gap-2 rounded-md border border-border/70 bg-background/40 px-2 py-1.5"
                >
                  <Input
                    id={`field-name-${index}`}
                    value={field.fieldName}
                    onChange={(event) =>
                      updateField(index, { fieldName: event.target.value })
                    }
                    placeholder="Field name"
                    aria-label={`Field name ${index + 1}`}
                    className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
                  />
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={field.optional}
                      onChange={(event) =>
                        updateField(index, { optional: event.target.checked })
                      }
                      className="size-3.5 rounded border border-input"
                    />
                    Optional
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(index)}
                    title="Delete field"
                    aria-label="Delete field"
                    className="h-7 w-7 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
