import { OnDemandTemplate } from "../types/on-demand-template.type";
import { clampTemplateIndex, cloneTemplate } from "./on-demand-template-selection.utils";

type PersistOnDemandTemplatesDeps = {
  saveTemplates: (templates: OnDemandTemplate[]) => Promise<void>;
  setSelectedIndex: (index: number) => Promise<void>;
  setSelectedTemplate: (template: OnDemandTemplate | null) => void;
};

export async function persistOnDemandTemplates(
  nextTemplates: OnDemandTemplate[],
  nextSelectedIndex: number,
  deps: PersistOnDemandTemplatesDeps,
): Promise<void> {
  await deps.saveTemplates(nextTemplates);
  const index = clampTemplateIndex(nextSelectedIndex, nextTemplates.length);
  await deps.setSelectedIndex(index);
  const template = nextTemplates[index];
  deps.setSelectedTemplate(template ? cloneTemplate(template) : null);
}
