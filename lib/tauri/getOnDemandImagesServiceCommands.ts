import { OnDemandTemplate } from "@/components/on-demand-image/types/on-demand-template.type";
import { invoke } from "@tauri-apps/api/core";

interface OnDemandImagesServiceCommands {
  evaluateSelectedImageOnDemand: (
    imagePath: string,
    template: OnDemandTemplate,
    openaiApiKey: string,
  ) => Promise<string>;
}

export default function getOnDemandImagesServiceCommands(): OnDemandImagesServiceCommands {
  return {
    evaluateSelectedImageOnDemand: (imagePath, template, openaiApiKey) =>
      invoke("evaluate_selected_image_on_demand", {
        imagePath,
        template,
        openaiApiKey,
      }),
  };
}
