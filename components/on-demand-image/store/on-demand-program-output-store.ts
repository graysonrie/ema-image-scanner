import { create } from "zustand";

interface Store {
  output: string;
  isEvaluating: boolean;
  setOutput: (output: string) => void;
  setIsEvaluating: (isEvaluating: boolean) => void;
  clearOutput: () => void;
}

export const useOnDemandProgramOutputStore = create<Store>((set) => ({
  output: "",
  isEvaluating: false,
  setOutput: (output) => set({ output }),
  setIsEvaluating: (isEvaluating) => set({ isEvaluating }),
  clearOutput: () => set({ output: "", isEvaluating: false }),
}));
