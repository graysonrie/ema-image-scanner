import { useEffect } from "react";
import { useOnDemandTemplatesStore } from "../store/on-demand-templates-store";

export default function useOnDemandTemplatesHydration() {
  const hydrateFromTauri = useOnDemandTemplatesStore(
    (state) => state.hydrateFromTauri,
  );

  useEffect(() => {
    hydrateFromTauri();
  }, [hydrateFromTauri]);
}
