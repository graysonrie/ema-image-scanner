import { OnDemandTemplate } from "@/components/on-demand-image/types/on-demand-template.type";
import { invoke } from "@tauri-apps/api/core";

interface OnDemandImagesServiceCommands {
  evaluateSelectedImageOnDemand: (
    imagePaths: string[],
    template: OnDemandTemplate,
    openaiApiKey: string,
  ) => Promise<string>;
}

export default function getOnDemandImagesServiceCommands(): OnDemandImagesServiceCommands {
  return {
    evaluateSelectedImageOnDemand: (imagePaths, template, openaiApiKey) =>
      invoke("evaluate_selected_image_on_demand", {
        imagePaths,
        template,
        openaiApiKey,
      }),
  };
}
