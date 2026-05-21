import { OnDemandTemplate } from "../types/on-demand-template.type";

export function cloneTemplate(template: OnDemandTemplate): OnDemandTemplate {
  return {
    name: template.name,
    fields: template.fields.map((field) => ({ ...field })),
  };
}

export function clampTemplateIndex(
  index: number | undefined,
  templateCount: number,
): number {
  if (templateCount === 0) {
    return 0;
  }

  if (typeof index !== "number" || index < 0) {
    return 0;
  }

  return Math.min(index, templateCount - 1);
}

export function selectedIndexAfterMove(
  selectedIndex: number,
  fromIndex: number,
  toIndex: number,
): number {
  if (selectedIndex === fromIndex) {
    return toIndex;
  }

  if (fromIndex < selectedIndex && toIndex >= selectedIndex) {
    return selectedIndex - 1;
  }

  if (fromIndex > selectedIndex && toIndex <= selectedIndex) {
    return selectedIndex + 1;
  }

  return selectedIndex;
}

export function selectedIndexAfterDelete(
  selectedIndex: number,
  deletedIndex: number,
  nextCount: number,
): number {
  if (nextCount === 0) {
    return 0;
  }

  if (selectedIndex > deletedIndex) {
    return selectedIndex - 1;
  }

  if (selectedIndex === deletedIndex) {
    return Math.min(deletedIndex, nextCount - 1);
  }

  return selectedIndex;
}
