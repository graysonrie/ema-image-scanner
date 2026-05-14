import getTauriCommands from "@/lib/hooks/getTauriCommands";
import { useProjectStore } from "@/lib/stores/projectStore";
import { useCallback, useEffect, useState } from "react";

export default function useProjects() {
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  const fetchProjectNames = useCallback(async () => {
    setIsLoading(true);
    try {
      const { getProjectNames } = getTauriCommands();
      const names = await getProjectNames();
      setProjectNames(names);
    } catch (error) {
      console.error("Failed to fetch project names:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectNames();
  }, [fetchProjectNames]);

  const createProject = useCallback(
    async (projectName: string) => {
      const { newProject } = getTauriCommands();
      await newProject(projectName);
      setActiveProject(projectName);
      await fetchProjectNames();
    },
    [fetchProjectNames, setActiveProject],
  );

  const selectProject = useCallback(
    async (projectName: string) => {
      try {
        const { recordProjectOpened } = getTauriCommands();
        await recordProjectOpened(projectName);
      } catch (error) {
        console.error("Failed to record project opened:", error);
      }
      setActiveProject(projectName);
    },
    [setActiveProject],
  );

  return {
    projectNames,
    isLoading,
    createProject,
    selectProject,
    refreshProjects: fetchProjectNames,
  };
}
