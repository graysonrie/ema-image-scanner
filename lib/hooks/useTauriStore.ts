import { useCallback } from "react";
import { load } from "@tauri-apps/plugin-store";

export default function useTauriStore() {
  const setValue = useCallback(async (key: string, value: unknown) => {
    const store = await load("config.json", { defaults: {} });
    await store.set(key, value);
  }, []);

  const getValue = useCallback(
    async <T,>(key: string): Promise<T | undefined> => {
      const store = await load("config.json", { defaults: {} });
      return await store.get(key);
    },
    [],
  );

  return {
    setValue,
    getValue,
  };
}
