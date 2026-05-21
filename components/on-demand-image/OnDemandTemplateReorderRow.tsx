"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type OnDemandTemplateReorderRowProps = {
  name: string;
  isFirst: boolean;
  isLast: boolean;
  showDelete: boolean;
  disabled?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};

export default function OnDemandTemplateReorderRow({
  name,
  isFirst,
  isLast,
  showDelete,
  disabled = false,
  onMoveUp,
  onMoveDown,
  onDelete,
}: OnDemandTemplateReorderRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/40 px-2 py-1.5">
      <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
      {!isFirst && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onMoveUp}
          title="Move template up"
          aria-label={`Move ${name} up`}
          className="h-7 w-7 shrink-0"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
      )}
      {!isLast && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onMoveDown}
          title="Move template down"
          aria-label={`Move ${name} down`}
          className="h-7 w-7 shrink-0"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
      )}
      {showDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onDelete}
          title="Delete template"
          aria-label={`Delete ${name}`}
          className="h-7 w-7 shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
