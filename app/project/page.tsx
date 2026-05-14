"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ProjectHeader,
  ImageSidebar,
  ImageViewer,
  FolderViewer,
  ExportEvaluationsModal,
  ExportResultModal,
  MoveToFolderModal,
  useProjectImages,
  useImageEvaluation,
  useProjectFolders,
} from "@/components/projects";
import useOpenAIApiKey from "@/lib/hooks/useOpenAIApiKey";
import useCustomPrompt from "@/lib/hooks/useCustomPrompt";
import getTauriCommands from "@/lib/hooks/getTauriCommands";
import { useProjectStore } from "@/lib/stores/projectStore";
import type { ExportMode } from "@/lib/hooks/models";

export default function ProjectPage() {
  const router = useRouter();
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const reset = useProjectStore((s) => s.reset);
  const selectedImageNames = useProjectStore((s) => s.selectedImageNames);
  const setSelectedImageNames = useProjectStore((s) => s.setSelectedImageNames);
  const setLastClickedImageName = useProjectStore((s) => s.setLastClickedImageName);
  const evaluatingImageNames = useProjectStore((s) => s.evaluatingImageNames);
  const { openAIApiKey } = useOpenAIApiKey();
  useCustomPrompt();
  const {
    imagePreviews, selectedImage, imageEvaluations,
    isLoadingPreviews, isLoadingFullImage, isEvaluating,
    selectImage, addImages, deleteImage, moveImagesToFolder,
    refreshPreviews, refreshEvaluations,
  } = useProjectImages();
  const {
    evaluateSelectedImage, evaluateNewImages, reevaluateAll,
    evaluateNewImagesInFolder, reevaluateAllInFolder,
  } = useImageEvaluation();
  const {
    folders, focusedFolder, setFocusedFolder,
    createFolder, renameFolder, deleteFolder, refreshFolders,
  } = useProjectFolders();

  const evaluatedImageNames = useMemo(() => imageEvaluations.map((e) => e.imageName), [imageEvaluations]);
  const evaluatedWithSuffixImageNames = useMemo(() => imageEvaluations.filter((e) => e.result?.newSuggestedFilepathSuffix).map((e) => e.imageName), [imageEvaluations]);
  const selectedImageEvaluation = useMemo(() => selectedImage ? imageEvaluations.find((e) => e.imageName === selectedImage.imageName) : undefined, [selectedImage, imageEvaluations]);
  const hasImages = imagePreviews.length > 0;
  const hasEvaluatedImages = imageEvaluations.length > 0;
  const hasUnevaluatedImages = useMemo(() => imagePreviews.some((p) => !evaluatedImageNames.includes(p.imageName)), [imagePreviews, evaluatedImageNames]);
  const folderPreviews = useMemo(() => focusedFolder ? imagePreviews.filter((p) => p.imageName.startsWith(`${focusedFolder}/`)) : [], [focusedFolder, imagePreviews]);
  const hasFolderImages = folderPreviews.length > 0;
  const hasFolderUnevaluatedImages = useMemo(() => folderPreviews.some((p) => !evaluatedImageNames.includes(p.imageName)), [folderPreviews, evaluatedImageNames]);
  const focusedFolderEvaluated = useMemo(() => focusedFolder ? imageEvaluations.filter((e) => e.imageName.startsWith(`${focusedFolder}/`) && !!e.result).sort((a, b) => a.imageName.localeCompare(b.imageName)) : [], [focusedFolder, imageEvaluations]);
  const focusedFolderEvaluations = useMemo(() => focusedFolderEvaluated.map((e) => ({ imageName: e.imageName, suffix: (e.result?.newSuggestedFilepathSuffix?.trim() || "").replace(/^_/, "").trim() })).filter((e) => e.suffix.length > 0), [focusedFolderEvaluated]);
  const focusedFolderUndeterminedCount = focusedFolderEvaluated.length - focusedFolderEvaluations.length;

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>("all");
  const [exportResultOpen, setExportResultOpen] = useState(false);
  const [exportResultErrors, setExportResultErrors] = useState<string[]>([]);
  const [exportResultPath, setExportResultPath] = useState("");
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [scrollToImageName, setScrollToImageName] = useState<string | null>(null);
  const canMoveToFolder = selectedImageNames.length > 0 && folders.length > 0;

  const handleExportComplete = (errors: string[], outputPath: string) => { setExportResultErrors(errors); setExportResultPath(outputPath); setExportResultOpen(true); };

  useEffect(() => {
    if (!activeProjectName) router.push("/");
  }, [activeProjectName, router]);

  const refreshAfterFolderChange = useCallback(async () => { await refreshPreviews(); await refreshEvaluations(); }, [refreshPreviews, refreshEvaluations]);
  const handleRenameFolder = useCallback((oldName: string, newName: string) => renameFolder(oldName, newName, refreshAfterFolderChange), [renameFolder, refreshAfterFolderChange]);
  const handleDeleteFolder = useCallback((folderName: string) => deleteFolder(folderName, refreshAfterFolderChange), [deleteFolder, refreshAfterFolderChange]);

  const handleMoveConfirm = useCallback(
    async (targetFolder: string | null) => {
      await moveImagesToFolder(selectedImageNames, targetFolder);
      await refreshFolders();
      setSelectedImageNames([]);
      setMoveModalOpen(false);
    },
    [moveImagesToFolder, selectedImageNames, refreshFolders, setSelectedImageNames]
  );
  const handleFolderItemSelect = useCallback((imageName: string) => { setSelectedImageNames([imageName]); setLastClickedImageName(imageName); setFocusedFolder(null); setScrollToImageName(imageName); selectImage(imageName); }, [setSelectedImageNames, setLastClickedImageName, setFocusedFolder, selectImage]);
  const handleOpenExternal = useCallback((imageName: string) => { if (!activeProjectName) return; getTauriCommands().openImageInDefaultApp(activeProjectName, imageName).catch(console.error); }, [activeProjectName]);

  if (!activeProjectName) return null;

  const k = openAIApiKey;

  return (
    <div className="flex h-[calc(100vh-2.5rem)] flex-col bg-background overflow-hidden">
      <ProjectHeader
        projectName={activeProjectName}
        onGoHome={() => { reset(); router.push("/"); }}
        onAddImages={addImages}
        onEvaluateThisImage={() => k && evaluateSelectedImage(k)}
        onEvaluateNewImages={() => k && evaluateNewImages(k)}
        onReevaluateAll={() => k && reevaluateAll(k)}
        onEvaluateNewInFolder={() => k && focusedFolder && evaluateNewImagesInFolder(k, focusedFolder)}
        onReevaluateAllInFolder={() => k && focusedFolder && reevaluateAllInFolder(k, focusedFolder)}
        onMoveToFolder={() => setMoveModalOpen(true)}
        canMoveToFolder={canMoveToFolder}
        onExportAll={() => {
          setExportMode("all");
          setExportModalOpen(true);
        }}
        onExportFolders={() => {
          setExportMode("folders");
          setExportModalOpen(true);
        }}
        isEvaluating={isEvaluating}
        canEvaluateThisImage={!!selectedImage && !!k}
        hasUnevaluatedImages={hasUnevaluatedImages}
        hasImages={hasImages}
        hasApiKey={!!k}
        hasEvaluatedImages={hasEvaluatedImages}
        focusedFolder={focusedFolder}
        hasFolderUnevaluatedImages={hasFolderUnevaluatedImages}
        hasFolderImages={hasFolderImages}
      />
      <ExportEvaluationsModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        projectName={activeProjectName}
        evaluations={imageEvaluations}
        mode={exportMode}
        onExportComplete={handleExportComplete}
      />
      <ExportResultModal open={exportResultOpen} onOpenChange={setExportResultOpen} errors={exportResultErrors} outputPath={exportResultPath} />
      <MoveToFolderModal open={moveModalOpen} onOpenChange={setMoveModalOpen} folders={folders} imageCount={selectedImageNames.length} onConfirm={handleMoveConfirm} />
      <div className="flex flex-1 overflow-hidden">
        <ImageSidebar
          imagePreviews={imagePreviews} selectedImage={selectedImage}
          evaluatedImageNames={evaluatedImageNames} evaluatedWithSuffixImageNames={evaluatedWithSuffixImageNames} evaluatingImageNames={evaluatingImageNames}
          isLoading={isLoadingPreviews} folders={folders} focusedFolder={focusedFolder}
          onSelectImage={selectImage} onOpenExternal={handleOpenExternal} onDeleteImage={deleteImage}
          scrollToImageName={scrollToImageName} onScrollHandled={() => setScrollToImageName(null)}
          onFocusFolder={setFocusedFolder} onCreateFolder={createFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
        />
        {focusedFolder ? <FolderViewer folderName={focusedFolder} evaluations={focusedFolderEvaluations} evaluatedCount={focusedFolderEvaluated.length} undeterminedCount={focusedFolderUndeterminedCount} onSelectImage={handleFolderItemSelect} /> : <ImageViewer selectedImage={selectedImage} evaluation={selectedImageEvaluation} isLoading={isLoadingFullImage} />}
      </div>
    </div>
  );
}
