"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, ChevronDown, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import getTauriCommands from "@/lib/hooks/getTauriCommands";
import DeleteProjectDialog from "./DeleteProjectDialog";

interface ArchivedProjectsSectionProps {
  /** Called after unarchive or delete so the parent can refresh active projects */
  onProjectChanged: () => void;
  /** Incremented externally to signal a refresh (e.g. after archiving) */
  refreshKey: number;
}

export default function ArchivedProjectsSection({
  onProjectChanged,
  refreshKey,
}: ArchivedProjectsSectionProps) {
  const [archivedNames, setArchivedNames] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchArchived = useCallback(async () => {
    try {
      const { getArchivedProjectNames } = getTauriCommands();
      const names = await getArchivedProjectNames();
      setArchivedNames(names);
    } catch (error) {
      console.error("Failed to fetch archived projects:", error);
    }
  }, []);

  useEffect(() => {
    fetchArchived();
  }, [fetchArchived, refreshKey]);

  const handleUnarchive = async (name: string) => {
    try {
      const { unarchiveProject } = getTauriCommands();
      await unarchiveProject(name);
      await fetchArchived();
      onProjectChanged();
    } catch (error) {
      console.error("Failed to unarchive project:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { deleteArchivedProject } = getTauriCommands();
      await deleteArchivedProject(deleteTarget);
      setDeleteTarget(null);
      await fetchArchived();
    } catch (error) {
      console.error("Failed to delete archived project:", error);
    }
  };

  if (archivedNames.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          className="justify-start text-muted-foreground"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 mr-1" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-1" />
          )}
          <Archive className="w-4 h-4 mr-1" />
          Archived ({archivedNames.length})
        </Button>

        {expanded &&
          archivedNames.map((name) => (
            <div
              key={name}
              className="flex items-center gap-1 pl-4"
            >
              <span className="text-sm text-muted-foreground truncate flex-1">
                {name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                title="Restore project"
                onClick={() => handleUnarchive(name)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                title="Delete permanently"
                onClick={() => setDeleteTarget(name)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
      </div>

      {deleteTarget && (
        <DeleteProjectDialog
          projectName={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
