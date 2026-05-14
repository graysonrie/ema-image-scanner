"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Home, ImagePlus, FolderInput } from "lucide-react";
import EvaluateDropdown from "./EvaluateDropdown";
import ExportDropdown from "./ExportDropdown";

interface ProjectHeaderProps {
  projectName: string;
  onGoHome: () => void;
  onAddImages: () => void;
  onEvaluateThisImage: () => void;
  onEvaluateNewImages: () => void;
  onReevaluateAll: () => void;
  onEvaluateNewInFolder: () => void;
  onReevaluateAllInFolder: () => void;
  onMoveToFolder: () => void;
  canMoveToFolder: boolean;
  onExportAll: () => void;
  onExportFolders: () => void;
  isEvaluating: boolean;
  canEvaluateThisImage: boolean;
  hasUnevaluatedImages: boolean;
  hasImages: boolean;
  hasApiKey: boolean;
  hasEvaluatedImages: boolean;
  focusedFolder: string | null;
  hasFolderUnevaluatedImages: boolean;
  hasFolderImages: boolean;
}

export function ProjectHeader({
  projectName,
  onGoHome,
  onAddImages,
  onEvaluateThisImage,
  onEvaluateNewImages,
  onReevaluateAll,
  onEvaluateNewInFolder,
  onReevaluateAllInFolder,
  onMoveToFolder,
  canMoveToFolder,
  onExportAll,
  onExportFolders,
  isEvaluating,
  canEvaluateThisImage,
  hasUnevaluatedImages,
  hasImages,
  hasApiKey,
  hasEvaluatedImages,
  focusedFolder,
  hasFolderUnevaluatedImages,
  hasFolderImages,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onGoHome} title="Home">
          <Home className="w-4 h-4 shrink-0 sm:mr-2" />
          <span className="hidden sm:inline">Home</span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-md font-semibold pb-0.5">{projectName}</h1>
      </div>
      <div className="flex items-center gap-2">
        {hasEvaluatedImages && (
          <ExportDropdown
            onExportAll={onExportAll}
            onExportFolders={onExportFolders}
          />
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={onMoveToFolder}
          disabled={!canMoveToFolder}
          title="Move to Folder"
        >
          <FolderInput className="w-4 h-4 shrink-0 sm:mr-2" />
          <span className="hidden sm:inline">Move</span>
        </Button>
        <EvaluateDropdown
          onEvaluateThisImage={onEvaluateThisImage}
          onEvaluateNewImages={onEvaluateNewImages}
          onReevaluateAll={onReevaluateAll}
          onEvaluateNewInFolder={onEvaluateNewInFolder}
          onReevaluateAllInFolder={onReevaluateAllInFolder}
          isEvaluating={isEvaluating}
          canEvaluateThisImage={canEvaluateThisImage}
          hasUnevaluatedImages={hasUnevaluatedImages}
          hasImages={hasImages}
          hasApiKey={hasApiKey}
          focusedFolder={focusedFolder}
          hasFolderUnevaluatedImages={hasFolderUnevaluatedImages}
          hasFolderImages={hasFolderImages}
        />
        <Button size="sm" onClick={onAddImages} title="Add Images">
          <ImagePlus className="w-4 h-4 shrink-0 sm:mr-2" />
          <span className="hidden sm:inline">Add Images</span>
        </Button>
      </div>
    </div>
  );
}
