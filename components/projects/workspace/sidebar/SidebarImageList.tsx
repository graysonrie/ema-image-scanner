"use client";

import { ImagePreviewItem } from "./ImagePreviewItem";
import type { ImagePreviewModel, FullImageModel } from "@/lib/hooks/models";

interface SidebarImageListProps {
  images: ImagePreviewModel[];
  selectedImage: FullImageModel | null;
  evaluatedImageNames: string[];
  evaluatedWithSuffixImageNames: string[];
  evaluatingImageNames: string[];
  selectedImageNames: string[];
  scrollToImageName: string | null;
  onScrollHandled: () => void;
  onImageClick: (imageName: string, e: React.MouseEvent) => void;
  onOpenExternal: (imageName: string) => void;
  onDeleteImage: (imageName: string) => void;
}

export default function SidebarImageList({
  images,
  selectedImage,
  evaluatedImageNames,
  evaluatedWithSuffixImageNames,
  evaluatingImageNames,
  selectedImageNames,
  scrollToImageName,
  onScrollHandled,
  onImageClick,
  onOpenExternal,
  onDeleteImage,
}: SidebarImageListProps) {
  return (
    <>
      {images.map((preview) => (
        <ImagePreviewItem
          key={preview.imageName}
          preview={preview}
          isSelected={selectedImage?.imageName === preview.imageName}
          isMultiSelected={selectedImageNames.includes(preview.imageName)}
          isEvaluated={evaluatedImageNames.includes(preview.imageName)}
          hasSuggestedSuffix={evaluatedWithSuffixImageNames.includes(
            preview.imageName
          )}
          isBeingEvaluated={evaluatingImageNames.includes(preview.imageName)}
          shouldScrollIntoView={scrollToImageName === preview.imageName}
          onScrollHandled={onScrollHandled}
          onSelect={(e) => onImageClick(preview.imageName, e)}
          onOpenExternal={() => onOpenExternal(preview.imageName)}
          onDelete={() => onDeleteImage(preview.imageName)}
        />
      ))}
    </>
  );
}
