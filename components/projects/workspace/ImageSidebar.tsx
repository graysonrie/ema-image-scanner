"use client";

import { useMemo, useState } from "react";
import { Loader2, ImageIcon, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SidebarImageList from "./SidebarImageList";
import SidebarFolderItem from "./SidebarFolderItem";
import CreateFolderDialog from "./CreateFolderDialog";
import { useProjectStore } from "@/lib/stores/projectStore";
import type { ImagePreviewModel, FullImageModel } from "@/lib/hooks/models";

interface ImageSidebarProps {
  imagePreviews: ImagePreviewModel[];
  selectedImage: FullImageModel | null;
  evaluatedImageNames: string[];
  evaluatedWithSuffixImageNames: string[];
  evaluatingImageNames: string[];
  isLoading: boolean;
  folders: string[];
  focusedFolder: string | null;
  onSelectImage: (imageName: string) => void;
  onOpenExternal: (imageName: string) => void;
  onDeleteImage: (imageName: string) => void;
  onFocusFolder: (folder: string | null) => void;
  scrollToImageName: string | null;
  onScrollHandled: () => void;
  onCreateFolder: (folderName: string) => Promise<void>;
  onDeleteFolder: (folderName: string) => void;
  onRenameFolder: (oldName: string, newName: string) => void;
}

export function ImageSidebar({
  imagePreviews, selectedImage,
  evaluatedImageNames, evaluatedWithSuffixImageNames, evaluatingImageNames,
  isLoading, folders, focusedFolder,
  onSelectImage, onOpenExternal, onDeleteImage, onFocusFolder,
  scrollToImageName, onScrollHandled,
  onCreateFolder, onDeleteFolder, onRenameFolder,
}: ImageSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const selectedImageNames = useProjectStore((s) => s.selectedImageNames);
  const lastClickedImageName = useProjectStore((s) => s.lastClickedImageName);
  const setSelectedImageNames = useProjectStore((s) => s.setSelectedImageNames);
  const setLastClickedImageName = useProjectStore((s) => s.setLastClickedImageName);

  const rootImages = imagePreviews.filter((p) => !p.imageName.includes("/"));
  const folderImages = (folder: string) =>
    imagePreviews.filter((p) => p.imageName.startsWith(`${folder}/`));

  // Flat ordered list of all image names for shift-click range selection
  const flatImageNames = useMemo(() => {
    const names: string[] = rootImages.map((p) => p.imageName);
    for (const folder of folders) {
      for (const p of folderImages(folder)) {
        names.push(p.imageName);
      }
    }
    return names;
  }, [imagePreviews, folders]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder); else next.add(folder);
      return next;
    });
  };

  const handleImageClick = (imageName: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Toggle this image in the selection
      const current = [...selectedImageNames];
      const idx = current.indexOf(imageName);
      if (idx >= 0) current.splice(idx, 1); else current.push(imageName);
      setSelectedImageNames(current);
      setLastClickedImageName(imageName);
    } else if (e.shiftKey && lastClickedImageName) {
      // Range select from lastClicked to current
      const startIdx = flatImageNames.indexOf(lastClickedImageName);
      const endIdx = flatImageNames.indexOf(imageName);
      if (startIdx >= 0 && endIdx >= 0) {
        const lo = Math.min(startIdx, endIdx);
        const hi = Math.max(startIdx, endIdx);
        const range = flatImageNames.slice(lo, hi + 1);
        const merged = new Set([...selectedImageNames, ...range]);
        setSelectedImageNames([...merged]);
      }
    } else {
      // Plain click — single select
      setSelectedImageNames([imageName]);
      setLastClickedImageName(imageName);
    }
    onFocusFolder(null);
    onSelectImage(imageName);
  };

  const pendingImageCount = useProjectStore((s) => s.pendingImageCount);

  const sharedListProps = {
    selectedImage, evaluatedImageNames, evaluatedWithSuffixImageNames,
    evaluatingImageNames, selectedImageNames,
    scrollToImageName, onScrollHandled,
    onImageClick: handleImageClick, onOpenExternal, onDeleteImage,
  };

  const totalCount = imagePreviews.length;

  return (
    <>
      <div className="w-64 border-r flex flex-col overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Images ({totalCount})</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreateFolder(true)} title="New folder">
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>
        <div
          className="flex-1 overflow-y-auto p-2"
          onClick={(e) => { if (e.target === e.currentTarget) onFocusFolder(null); }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : totalCount === 0 && folders.length === 0 && pendingImageCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No images yet.<br />Click &quot;Add Images&quot; to import.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <SidebarImageList images={rootImages} {...sharedListProps} />
              {pendingImageCount > 0 &&
                Array.from({ length: pendingImageCount }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="flex items-center gap-2 p-2">
                    <Skeleton className="w-12 h-12 rounded shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              {folders.map((folder) => {
                const images = folderImages(folder);
                return (
                  <SidebarFolderItem
                    key={folder} folderName={folder} imageCount={images.length}
                    isFocused={focusedFolder === folder} isExpanded={expandedFolders.has(folder)}
                    onToggleExpand={() => toggleFolder(folder)} onFocus={() => { setSelectedImageNames([]); onFocusFolder(folder); }}
                    onDelete={() => onDeleteFolder(folder)}
                    onRename={(newName) => onRenameFolder(folder, newName)}
                  >
                    <SidebarImageList images={images} {...sharedListProps} />
                  </SidebarFolderItem>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <CreateFolderDialog open={showCreateFolder} onOpenChange={setShowCreateFolder} onCreateFolder={onCreateFolder} />
    </>
  );
}
