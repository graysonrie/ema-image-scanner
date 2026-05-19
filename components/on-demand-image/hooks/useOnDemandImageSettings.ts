import useTauriStore from "@/lib/hooks/useTauriStore";
import { useCallback, useEffect, useState } from "react";
import { WAIT_FOR_MANUAL_EVAL_TRIGGER_STORAGE_KEY } from "../constants/on-demand-template.constants";

export default function useOnDemandImageSettings() {
  const { getValue, setValue } = useTauriStore();

  const [waitForManualEvalTrigger, setWaitForManualEvalTrigger] =
    useState<boolean>(false);

  useEffect(() => {
    getValue<boolean>(WAIT_FOR_MANUAL_EVAL_TRIGGER_STORAGE_KEY).then(
      (value) => {
        setWaitForManualEvalTrigger(value ?? true);
      }
    );
  }, [getValue]);

  const saveWaitForManualEvalTrigger = useCallback(async (value: boolean) => {
    setWaitForManualEvalTrigger(value);
    await setValue(WAIT_FOR_MANUAL_EVAL_TRIGGER_STORAGE_KEY, value);
  }, []);

  return {
    waitForManualEvalTrigger,
    saveWaitForManualEvalTrigger,
  };
}
