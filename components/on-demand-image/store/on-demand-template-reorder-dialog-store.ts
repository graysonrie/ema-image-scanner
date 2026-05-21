import { create } from "zustand";

interface Store {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const useOnDemandTemplateReorderDialogStore = create<Store>((set) => ({
  isOpen: false,
  setIsOpen: (val) => {
    set({ isOpen: val });
  },
}));
