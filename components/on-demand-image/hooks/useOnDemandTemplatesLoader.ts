import { useCallback } from "react";
import { useOnDemandTemplatesStore } from "../store/on-demand-templates-store";
import { OnDemandTemplate } from "../types/on-demand-template.type";

export default function useOnDemandTemplatesLoader() {
  const templates = useOnDemandTemplatesStore((state) => state.templates);
  const setTemplates = useOnDemandTemplatesStore((state) => state.setTemplates);
  const saveTemplates = useOnDemandTemplatesStore((state) => state.saveTemplates);
  const reloadFromTauri = useOnDemandTemplatesStore(
    (state) => state.reloadFromTauri,
  );

  const reloadTemplates = useCallback(async () => {
    reloadFromTauri();
  }, [reloadFromTauri]);

  return { templates, setTemplates, saveTemplates, reloadTemplates };
}
