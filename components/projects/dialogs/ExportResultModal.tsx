"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import getTauriCommands from "@/lib/hooks/getTauriCommands";

interface ExportResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errors: string[];
  outputPath: string;
}

export function ExportResultModal({
  open: isOpen,
  onOpenChange,
  errors,
  outputPath,
}: ExportResultModalProps) {
  const isSuccess = errors.length === 0;

  const handleOpenFolder = async () => {
    try {
      const { openPathInFileManager } = getTauriCommands();
      await openPathInFileManager(outputPath);
    } catch (err) {
      console.error("Failed to open folder:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Export complete
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-destructive" />
                Export completed with errors
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Evaluated images were exported successfully."
              : `${errors.length} error(s) occurred while exporting. Some files may have been exported.`}
          </DialogDescription>
        </DialogHeader>
        {!isSuccess && (
          <div className="rounded-md border bg-destructive/5 border-destructive/20 p-3 max-h-40 overflow-y-auto">
            <ul className="text-sm text-destructive space-y-1 list-disc list-inside">
              {errors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
        {isSuccess && (
          <p className="text-sm text-muted-foreground truncate" title={outputPath}>
            {outputPath}
          </p>
        )}
        <DialogFooter>
          {isSuccess && (
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenFolder}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open output folder
            </Button>
          )}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
