import { useCallback, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import getTauriCommands from "@/lib/hooks/getTauriCommands";
import { useProjectStore } from "@/lib/stores/projectStore";

export default function useProjectImages() {
  const store = useProjectStore();
  const {
    activeProjectName, imagePreviews, selectedImage, imageEvaluations,
    focusedFolder, isLoadingPreviews, isLoadingFullImage, isEvaluating,
    setImagePreviews, setSelectedImage, setImageEvaluations,
    setIsLoadingPreviews, setIsLoadingFullImage,
  } = store;

  const loadPreviews = useCallback(async () => {
    if (!activeProjectName) return;
    setIsLoadingPreviews(true);
    try {
      const { getImagePreviewsInProject } = getTauriCommands();
      const previews = await getImagePreviewsInProject(activeProjectName);
      setImagePreviews(previews);
    } catch (error) {
      console.error("Failed to load image previews:", error);
      toast.error("Failed to load image previews", {
        description: String(error),
      });
    } finally {
      setIsLoadingPreviews(false);
    }
  }, [activeProjectName, setImagePreviews, setIsLoadingPreviews]);

  const loadEvaluations = useCallback(async () => {
    if (!activeProjectName) return;
    try {
      const { getImageEvaluations } = getTauriCommands();
      const evaluations = await getImageEvaluations(activeProjectName);
      setImageEvaluations(evaluations);
    } catch (error) {
      console.error("Failed to load image evaluations:", error);
    }
  }, [activeProjectName, setImageEvaluations]);

  useEffect(() => {
    loadPreviews();
    loadEvaluations();
  }, [loadPreviews, loadEvaluations]);

  const selectImage = useCallback(
    async (imageName: string) => {
      if (!activeProjectName) return;
      setIsLoadingFullImage(true);
      try {
        const { loadImageFromProject } = getTauriCommands();
        const fullImage = await loadImageFromProject(
          activeProjectName,
          imageName
        );
        setSelectedImage(fullImage);
      } catch (error) {
        console.error("Failed to load full image:", error);
        toast.error(`Failed to load "${imageName}"`, {
          description: String(error),
        });
      } finally {
        setIsLoadingFullImage(false);
      }
    },
    [activeProjectName, setSelectedImage, setIsLoadingFullImage]
  );

  const setPendingImageCount = useProjectStore((s) => s.setPendingImageCount);

  const addImages = useCallback(async () => {
    if (!activeProjectName) return;
    const selected = await open({
      multiple: true,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
    });
    if (!selected || selected.length === 0) return;
    setPendingImageCount(selected.length);
    try {
      const { importImagesToProject } = getTauriCommands();
      await importImagesToProject(activeProjectName, selected, focusedFolder);
      await loadPreviews();
    } catch (error) {
      console.error("Failed to import images:", error);
      toast.error("Failed to import images", {
        description: String(error),
      });
    } finally {
      setPendingImageCount(0);
    }
  }, [activeProjectName, focusedFolder, loadPreviews, setPendingImageCount]);

  const deleteImage = useCallback(
    async (imageName: string) => {
      if (!activeProjectName) return;
      try {
        const { deleteImagesFromProject } = getTauriCommands();
        await deleteImagesFromProject(activeProjectName, [imageName]);
        if (selectedImage?.imageName === imageName) setSelectedImage(null);
        setImagePreviews(
          imagePreviews.filter((p) => p.imageName !== imageName)
        );
      } catch (error) {
        console.error("Failed to delete image:", error);
        toast.error(`Failed to delete "${imageName}"`, {
          description: String(error),
        });
      }
    },
    [activeProjectName, selectedImage, imagePreviews, setSelectedImage, setImagePreviews]
  );

  const moveImagesToFolder = useCallback(
    async (imageNames: string[], targetFolder: string | null) => {
      if (!activeProjectName) return;
      try {
        const { moveImagesInProject } = getTauriCommands();
        await moveImagesInProject(activeProjectName, imageNames, targetFolder);
        await loadPreviews();
        await loadEvaluations();
      } catch (error) {
        console.error("Failed to move images:", error);
        toast.error("Failed to move images", {
          description: String(error),
        });
      }
    },
    [activeProjectName, loadPreviews, loadEvaluations]
  );

  return {
    activeProjectName,
    imagePreviews,
    selectedImage,
    imageEvaluations,
    focusedFolder,
    isLoadingPreviews,
    isLoadingFullImage,
    isEvaluating,
    selectImage,
    addImages,
    deleteImage,
    moveImagesToFolder,
    refreshPreviews: loadPreviews,
    refreshEvaluations: loadEvaluations,
  };
}
