import { useCallback, useEffect, useRef, useState } from "react";
import useTauriStore from "@/lib/hooks/useTauriStore";
import { OnDemandTemplate } from "../types/on-demand-template.type";
import { ON_DEMAND_TEMPLATES_STORAGE_KEY } from "../constants/on-demand-template.constants";

export default function useOnDemandTemplatesLoader() {
  const [templates, setTemplatesState] = useState<OnDemandTemplate[]>([]);
  const hasLocalChangesRef = useRef(false);
  const { getValue, setValue } = useTauriStore();

  const setTemplates = useCallback(
    (
      nextTemplates:
        | OnDemandTemplate[]
        | ((previous: OnDemandTemplate[]) => OnDemandTemplate[]),
    ) => {
      hasLocalChangesRef.current = true;
      setTemplatesState(nextTemplates);
    },
    [],
  );

  const loadTemplates = useCallback(async () => {
    const stored =
      await getValue<OnDemandTemplate[]>(ON_DEMAND_TEMPLATES_STORAGE_KEY);
    setTemplatesState((current) => {
      if (hasLocalChangesRef.current) {
        return current;
      }
      return stored ?? [];
    });
  }, [getValue]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const saveTemplates = useCallback(
    async (nextTemplates: OnDemandTemplate[]) => {
      await setValue(ON_DEMAND_TEMPLATES_STORAGE_KEY, nextTemplates);
      hasLocalChangesRef.current = false;
      setTemplatesState(nextTemplates);
    },
    [setValue],
  );

  const reloadTemplates = useCallback(async () => {
    hasLocalChangesRef.current = false;
    await loadTemplates();
  }, [loadTemplates]);

  return { templates, setTemplates, saveTemplates, reloadTemplates };
}
