"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useProjects from "./useProjects";
import CreateNewProjectModal from "./CreateNewProjectModal";
import ProjectItemMenu from "./ProjectItemMenu";
import ArchivedProjectsSection from "./ArchivedProjectsSection";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FolderOpen, Image, PlusIcon, Loader2 } from "lucide-react";

export default function ProjectsViewer() {
  const router = useRouter();
  const { projectNames, isLoading, createProject, selectProject, refreshProjects } =
    useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [archivedRefreshKey, setArchivedRefreshKey] = useState(0);

  const handleProjectChanged = () => {
    refreshProjects();
    setArchivedRefreshKey((k) => k + 1);
  };

  const handleCreateProject = async (projectName: string) => {
    await createProject(projectName);
    router.push("/project");
  };

  const handleProjectClick = async (projectName: string) => {
    await selectProject(projectName);
    router.push("/project");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <CardTitle>Projects</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : projectNames.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No projects yet. Create one to get started!
              </p>
            ) : (
              projectNames.map((projectName) => (
                <div key={projectName} className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    className="justify-start max-w-full flex-1 min-w-0"
                    onClick={() => handleProjectClick(projectName)}
                  >
                    <FolderOpen className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{projectName}</span>
                  </Button>
                  <ProjectItemMenu
                    projectName={projectName}
                    onProjectChanged={handleProjectChanged}
                  />
                </div>
              ))
            )}
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4" /> New Project
            </Button>
            <ArchivedProjectsSection
              onProjectChanged={handleProjectChanged}
              refreshKey={archivedRefreshKey}
            />
          </div>
        </CardContent>
      </Card>

      <CreateNewProjectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}
