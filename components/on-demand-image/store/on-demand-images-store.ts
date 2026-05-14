import { create } from "zustand";
import { OnDemandTemplate } from "../types/on-demand-template.type";

interface Store {
  currentImagePath: string | null;
  setCurrentImagePath: (path: string | null) => void;
  selectedTemplate: OnDemandTemplate | null;
  setSelectedTemplate: (template: OnDemandTemplate | null) => void;
}

export const useOnDemandImagesStore = create<Store>((set) => ({
  currentImagePath: null,
  setCurrentImagePath: (path) => set({ currentImagePath: path }),
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}));
