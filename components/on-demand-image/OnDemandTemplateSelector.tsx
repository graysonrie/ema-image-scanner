"use client";

import { ChevronDown, FileTextIcon, Plus, SettingsIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import OnDemandTemplateEditor from "./OnDemandTemplateEditor";
import useOnDemandTemplateSelection from "./hooks/useOnDemandTemplateSelection";
import { useOnDemandTemplateReorderDialogStore } from "./store/on-demand-template-reorder-dialog-store";

export default function OnDemandTemplateSelector() {
  const {
    templates,
    draft,
    setDraft,
    canSave,
    isSaving,
    selectTemplateAt,
    handleCreateTemplate,
    handleSave,
  } = useOnDemandTemplateSelection();

  const { setIsOpen } = useOnDemandTemplateReorderDialogStore();

  const onSettingsClick = function () {
    setIsOpen(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-muted/20">
      <div className="shrink-0 space-y-2 border-b border-border px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            <span>Selected Template </span>
          </div>

          <div className="gap-2 flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              title="Settings"
              aria-label="Settings"
              className="h-7 w-7"
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCreateTemplate}
              title="New template"
              aria-label="New template"
              className="h-7 w-7"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full justify-between font-normal"
              disabled={templates.length === 0}
            >
              <span className="truncate">
                {draft?.name ?? "Select a template"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width)"
          >
            {templates.map((template, index) => (
              <DropdownMenuItem
                key={`${template.name}-${index}`}
                onClick={() => selectTemplateAt(index)}
              >
                {template.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2">
        {draft ? (
          <OnDemandTemplateEditor
            draft={draft}
            onDraftChange={setDraft}
            onSave={() => void handleSave()}
            canSave={canSave}
            isSaving={isSaving}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Create a template to get started.
          </p>
        )}
      </div>
    </div>
  );
}
