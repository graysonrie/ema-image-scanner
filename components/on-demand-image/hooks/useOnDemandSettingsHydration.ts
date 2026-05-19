import { useEffect } from "react";
import { useOnDemandSettingsStore } from "../store/on-demand-settings-store";

export default function useOnDemandSettingsHydration() {
  const hydrateFromTauri = useOnDemandSettingsStore(
    (state) => state.hydrateFromTauri,
  );

  useEffect(() => {
    hydrateFromTauri();
  }, [hydrateFromTauri]);
}
