"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DeleteFolderDialog from "./DeleteFolderDialog";

interface SidebarFolderItemProps {
  folderName: string;
  imageCount: number;
  isFocused: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFocus: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  children: React.ReactNode;
}

export default function SidebarFolderItem({
  folderName,
  imageCount,
  isFocused,
  isExpanded,
  onToggleExpand,
  onFocus,
  onDelete,
  onRename,
  children,
}: SidebarFolderItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(folderName);

  useEffect(() => {
    setEditValue(folderName);
  }, [folderName]);

  const commitRename = useCallback(() => {
    const trimmed = editValue.trim();
    setIsEditing(false);
    if (trimmed && trimmed !== folderName) {
      onRename(trimmed);
    } else {
      setEditValue(folderName);
    }
  }, [editValue, folderName, onRename]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    if (!isExpanded) {
      onToggleExpand();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitRename();
    } else if (e.key === "Escape") {
      setEditValue(folderName);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <div
          className={cn(
            "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
            isFocused && "bg-primary/15"
          )}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <button
            onClick={handleChevronClick}
            className="p-0.5 shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <Folder className="w-4 h-4 shrink-0 text-muted-foreground" />
          {isEditing ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              className="text-sm font-medium flex-1 min-w-0 bg-transparent border-b border-primary outline-none px-0.5"
            />
          ) : (
            <span className="text-sm font-medium truncate flex-1">
              {folderName}
            </span>
          )}
          <span className="text-xs text-muted-foreground shrink-0">
            {imageCount}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
            title="Delete folder"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        {isExpanded && (
          <div className="pl-4">{children}</div>
        )}
      </div>

      <DeleteFolderDialog
        folderName={folderName}
        imageCount={imageCount}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={onDelete}
      />
    </>
  );
}
