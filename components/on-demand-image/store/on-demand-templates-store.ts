import { load } from "@tauri-apps/plugin-store";
import { create } from "zustand";
import { ON_DEMAND_TEMPLATES_STORAGE_KEY } from "../constants/on-demand-template.constants";
import { OnDemandTemplate } from "../types/on-demand-template.type";

const CONFIG_STORE = "config.json";

async function readPersistedTemplates(): Promise<OnDemandTemplate[]> {
  const store = await load(CONFIG_STORE, { defaults: {} });
  const value = await store.get<OnDemandTemplate[]>(ON_DEMAND_TEMPLATES_STORAGE_KEY);
  return value ?? [];
}

async function writePersistedTemplates(
  templates: OnDemandTemplate[],
): Promise<void> {
  const store = await load(CONFIG_STORE, { defaults: {} });
  await store.set(ON_DEMAND_TEMPLATES_STORAGE_KEY, templates);
}

interface OnDemandTemplatesStore {
  templates: OnDemandTemplate[];
  hasLocalChanges: boolean;
  isHydrated: boolean;
  setTemplates: (
    next:
      | OnDemandTemplate[]
      | ((previous: OnDemandTemplate[]) => OnDemandTemplate[]),
  ) => void;
  hydrateFromPersistence: (templates: OnDemandTemplate[]) => void;
  hydrateFromTauri: () => void;
  reloadFromTauri: () => void;
  saveTemplates: (templates: OnDemandTemplate[]) => Promise<void>;
}

export const useOnDemandTemplatesStore = create<OnDemandTemplatesStore>(
  (set, get) => ({
    templates: [],
    hasLocalChanges: false,
    isHydrated: false,
    setTemplates: (next) =>
      set((state) => ({
        templates: typeof next === "function" ? next(state.templates) : next,
        hasLocalChanges: true,
      })),
    hydrateFromPersistence: (templates) =>
      set((state) =>
        state.isHydrated || state.hasLocalChanges
          ? state
          : { templates, isHydrated: true },
      ),
    hydrateFromTauri: () => {
      void readPersistedTemplates().then((templates) => {
        get().hydrateFromPersistence(templates);
      });
    },
    reloadFromTauri: () => {
      void readPersistedTemplates().then((templates) => {
        set({ templates, hasLocalChanges: false, isHydrated: true });
      });
    },
    saveTemplates: async (templates) => {
      await writePersistedTemplates(templates);
      set({ templates, hasLocalChanges: false, isHydrated: true });
    },
  }),
);
