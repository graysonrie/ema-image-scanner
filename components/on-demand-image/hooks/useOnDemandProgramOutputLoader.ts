import useTauriStore from "@/lib/hooks/useTauriStore";
import { useCallback, useEffect, useState } from "react";
import { ON_DEMAND_COPY_TO_SYSTEM_CLIPBOARD_STORAGE_KEY } from "../constants/on-demand-template.constants";

export default function useOnDemandProgramOutputLoader() {
  const { getValue, setValue } = useTauriStore();
  const [autoCopyToSystemClipboard, setAutoCopyToSystemClipboard] =
    useState<boolean>(false);

  useEffect(() => {
    getValue<boolean>(ON_DEMAND_COPY_TO_SYSTEM_CLIPBOARD_STORAGE_KEY).then(
      (value) => {
        setAutoCopyToSystemClipboard(value ?? true);
      },
    );
  }, [getValue]);

  const saveAutoCopyToSystemClipboard = useCallback(
    async (value: boolean) => {
      setAutoCopyToSystemClipboard(value);
      await setValue(ON_DEMAND_COPY_TO_SYSTEM_CLIPBOARD_STORAGE_KEY, value);
    },
    [setValue],
  );

  return { autoCopyToSystemClipboard, saveAutoCopyToSystemClipboard };
}
