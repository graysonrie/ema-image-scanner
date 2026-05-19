import { load } from "@tauri-apps/plugin-store";
import { create } from "zustand";
import { WAIT_FOR_MANUAL_EVAL_TRIGGER_STORAGE_KEY } from "../constants/on-demand-template.constants";

const CONFIG_STORE = "config.json";

async function readPersistedWaitForManualEvalTrigger(): Promise<boolean> {
  const store = await load(CONFIG_STORE, { defaults: {} });
  const value = await store.get<boolean>(WAIT_FOR_MANUAL_EVAL_TRIGGER_STORAGE_KEY);
  return value ?? true;
}

async function writePersistedWaitForManualEvalTrigger(
  value: boolean,
): Promise<void> {
  const store = await load(CONFIG_STORE, { defaults: {} });
  await store.set(WAIT_FOR_MANUAL_EVAL_TRIGGER_STORAGE_KEY, value);
}

interface OnDemandSettingsStore {
  waitForManualEvalTrigger: boolean;
  isHydrated: boolean;
  hydrateFromPersistence: (value: boolean) => void;
  hydrateFromTauri: () => void;
  setWaitForManualEvalTrigger: (value: boolean) => void;
}

export const useOnDemandSettingsStore = create<OnDemandSettingsStore>((set) => ({
  waitForManualEvalTrigger: false,
  isHydrated: false,
  hydrateFromPersistence: (value) =>
    set((state) =>
      state.isHydrated
        ? state
        : { waitForManualEvalTrigger: value, isHydrated: true },
    ),
  hydrateFromTauri: () => {
    void readPersistedWaitForManualEvalTrigger().then((value) => {
      useOnDemandSettingsStore.getState().hydrateFromPersistence(value);
    });
  },
  setWaitForManualEvalTrigger: (value) => {
    set({ waitForManualEvalTrigger: value, isHydrated: true });
    void writePersistedWaitForManualEvalTrigger(value);
  },
}));
