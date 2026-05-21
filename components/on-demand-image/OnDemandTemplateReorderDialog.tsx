"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useOnDemandTemplateReorder from "./hooks/useOnDemandTemplateReorder";
import OnDemandTemplateReorderRow from "./OnDemandTemplateReorderRow";
import { useOnDemandTemplateReorderDialogStore } from "./store/on-demand-template-reorder-dialog-store";

export default function OnDemandTemplateReorderDialog() {
  const { isOpen, setIsOpen } = useOnDemandTemplateReorderDialogStore();
  const { templates, isSaving, moveTemplate, deleteTemplate } =
    useOnDemandTemplateReorder();
  const showDelete = templates.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Template Settings</DialogTitle>
          <DialogDescription>
            Reorder or delete templates. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No templates yet. Create one from the template panel.
          </p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
            {templates.map((template, index) => (
              <li key={`${template.name}-${index}`}>
                <OnDemandTemplateReorderRow
                  name={template.name}
                  isFirst={index === 0}
                  isLast={index === templates.length - 1}
                  showDelete={showDelete}
                  disabled={isSaving}
                  onMoveUp={() => void moveTemplate(index, "up")}
                  onMoveDown={() => void moveTemplate(index, "down")}
                  onDelete={() => void deleteTemplate(index)}
                />
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
