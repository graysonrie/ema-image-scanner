"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface MoveToFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: string[];
  imageCount: number;
  onConfirm: (targetFolder: string | null) => void;
}

const ROOT_VALUE = "__root__";

export default function MoveToFolderModal({
  open,
  onOpenChange,
  folders,
  imageCount,
  onConfirm,
}: MoveToFolderModalProps) {
  const [selected, setSelected] = useState<string>(ROOT_VALUE);

  const handleConfirm = () => {
    onConfirm(selected === ROOT_VALUE ? null : selected);
    setSelected(ROOT_VALUE);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setSelected(ROOT_VALUE);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Folder</DialogTitle>
          <DialogDescription>
            Move {imageCount} selected image{imageCount !== 1 ? "s" : ""} to
            a folder.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="targetFolder">Destination</Label>
          <select
            id="targetFolder"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-2 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value={ROOT_VALUE}>(Root)</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
