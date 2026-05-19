import { create } from "zustand";
import { OnDemandTemplate } from "../types/on-demand-template.type";

interface Store {
  currentImagePaths: string[];
  setCurrentImagePaths: (paths: string[]) => void;
  removeCurrentImagePath: (path: string) => void;
  clearCurrentImagePaths: () => void;
  selectedTemplate: OnDemandTemplate | null;
  setSelectedTemplate: (template: OnDemandTemplate | null) => void;
}

export const useOnDemandImagesStore = create<Store>((set) => ({
  currentImagePaths: [],
  setCurrentImagePaths: (paths) => set({ currentImagePaths: paths }),
  removeCurrentImagePath: (path) =>
    set((state) => ({
      currentImagePaths: state.currentImagePaths.filter(
        (currentPath) => currentPath !== path,
      ),
    })),
  clearCurrentImagePaths: () => set({ currentImagePaths: [] }),
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}));
