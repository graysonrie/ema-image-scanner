import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import getTauriCommands from "@/lib/hooks/getTauriCommands";
import { useProjectStore } from "@/lib/stores/projectStore";

export default function useProjectFolders() {
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const focusedFolder = useProjectStore((s) => s.focusedFolder);
  const setFocusedFolder = useProjectStore((s) => s.setFocusedFolder);

  const [folders, setFolders] = useState<string[]>([]);

  const loadFolders = useCallback(async () => {
    if (!activeProjectName) return;
    try {
      const { getFoldersInProject } = getTauriCommands();
      const names = await getFoldersInProject(activeProjectName);
      setFolders(names);
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  }, [activeProjectName]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const createFolder = useCallback(
    async (folderName: string) => {
      if (!activeProjectName) return;
      const { createFolderInProject } = getTauriCommands();
      await createFolderInProject(activeProjectName, folderName);
      await loadFolders();
    },
    [activeProjectName, loadFolders]
  );

  const renameFolder = useCallback(
    async (oldName: string, newName: string, onRefresh: () => Promise<void>) => {
      if (!activeProjectName) return;
      try {
        const { renameFolderInProject } = getTauriCommands();
        await renameFolderInProject(activeProjectName, oldName, newName);
        if (focusedFolder === oldName) {
          setFocusedFolder(newName);
        }
        await loadFolders();
        await onRefresh();
      } catch (error) {
        console.error("Failed to rename folder:", error);
        toast.error("Failed to rename folder", {
          description: String(error),
        });
      }
    },
    [activeProjectName, focusedFolder, setFocusedFolder, loadFolders]
  );

  const deleteFolder = useCallback(
    async (folderName: string, onRefresh: () => Promise<void>) => {
      if (!activeProjectName) return;
      try {
        const { deleteFolderFromProject } = getTauriCommands();
        await deleteFolderFromProject(activeProjectName, folderName);
        if (focusedFolder === folderName) {
          setFocusedFolder(null);
        }
        await loadFolders();
        await onRefresh();
      } catch (error) {
        console.error("Failed to delete folder:", error);
        toast.error("Failed to delete folder", {
          description: String(error),
        });
      }
    },
    [activeProjectName, focusedFolder, setFocusedFolder, loadFolders]
  );

  return {
    folders,
    focusedFolder,
    setFocusedFolder,
    createFolder,
    renameFolder,
    deleteFolder,
    refreshFolders: loadFolders,
  };
}
