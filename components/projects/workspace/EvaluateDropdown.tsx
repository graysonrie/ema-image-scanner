"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sparkles, Loader2, ChevronDown } from "lucide-react";

interface EvaluateDropdownProps {
  onEvaluateThisImage: () => void;
  onEvaluateNewImages: () => void;
  onReevaluateAll: () => void;
  onEvaluateNewInFolder: () => void;
  onReevaluateAllInFolder: () => void;
  isEvaluating: boolean;
  canEvaluateThisImage: boolean;
  hasUnevaluatedImages: boolean;
  hasImages: boolean;
  hasApiKey: boolean;
  focusedFolder: string | null;
  hasFolderUnevaluatedImages: boolean;
  hasFolderImages: boolean;
}

export default function EvaluateDropdown({
  onEvaluateThisImage,
  onEvaluateNewImages,
  onReevaluateAll,
  onEvaluateNewInFolder,
  onReevaluateAllInFolder,
  isEvaluating,
  canEvaluateThisImage,
  hasUnevaluatedImages,
  hasImages,
  hasApiKey,
  focusedFolder,
  hasFolderUnevaluatedImages,
  hasFolderImages,
}: EvaluateDropdownProps) {
  const [reevaluateDialogOpen, setReevaluateDialogOpen] = useState(false);

  const evaluateDropdownEnabled = hasApiKey && hasImages && !isEvaluating;

  const handleReevaluateAllConfirm = () => {
    if (focusedFolder) {
      onReevaluateAllInFolder();
    } else {
      onReevaluateAll();
    }
    setReevaluateDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            disabled={!evaluateDropdownEnabled}
            title="Evaluate"
          >
            {isEvaluating ? (
              <Loader2 className="w-4 h-4 shrink-0 sm:mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Evaluate</span>
            <ChevronDown className="hidden w-4 h-4 sm:block ml-1 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={onEvaluateThisImage}
            disabled={!canEvaluateThisImage}
          >
            Evaluate This Image
          </DropdownMenuItem>
          {focusedFolder ? (
            <>
              <DropdownMenuItem
                onClick={onEvaluateNewInFolder}
                disabled={!hasFolderUnevaluatedImages}
              >
                Evaluate New Images in Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setReevaluateDialogOpen(true)}
                disabled={!hasFolderImages}
              >
                Reevaluate All in Folder
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={onEvaluateNewImages}
                disabled={!hasUnevaluatedImages}
              >
                Evaluate New Images
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setReevaluateDialogOpen(true)}
                disabled={!hasImages}
              >
                Reevaluate All
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={reevaluateDialogOpen}
        onOpenChange={setReevaluateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {focusedFolder
                ? `Reevaluate all images in "${focusedFolder}"?`
                : "Reevaluate all images?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will send a new evaluation request for every image
              {focusedFolder ? " in this folder" : " in the project"},
              including ones that already have evaluations. Existing
              evaluations will be overwritten. This may use more API credits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReevaluateAllConfirm}>
              {focusedFolder ? "Reevaluate Folder" : "Reevaluate All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
