"use client";

import { useState } from "react";
import { EllipsisVertical, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import getTauriCommands from "@/lib/hooks/getTauriCommands";
import DeleteProjectDialog from "./DeleteProjectDialog";
import ArchiveProjectDialog from "./ArchiveProjectDialog";

interface ProjectItemMenuProps {
  projectName: string;
  onProjectChanged: () => void;
}

export default function ProjectItemMenu({
  projectName,
  onProjectChanged,
}: ProjectItemMenuProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const handleDelete = async () => {
    try {
      const { deleteProject } = getTauriCommands();
      await deleteProject(projectName);
      onProjectChanged();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleArchive = async () => {
    try {
      const { archiveProject } = getTauriCommands();
      await archiveProject(projectName);
      onProjectChanged();
    } catch (error) {
      console.error("Failed to archive project:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowArchive(true)}>
            <Archive className="w-4 h-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProjectDialog
        projectName={projectName}
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
      />
      <ArchiveProjectDialog
        projectName={projectName}
        open={showArchive}
        onOpenChange={setShowArchive}
        onConfirm={handleArchive}
      />
    </>
  );
}
