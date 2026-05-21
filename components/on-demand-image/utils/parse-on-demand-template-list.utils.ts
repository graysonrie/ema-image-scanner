import { OnDemandTemplateList } from "../types/on-demand-template-list.type";
import { OnDemandTemplate, OnDemandTemplateField } from "../types/on-demand-template.type";

function isOnDemandTemplateField(value: unknown): value is OnDemandTemplateField {
  if (!value || typeof value !== "object") {
    return false;
  }

  const field = value as Record<string, unknown>;
  if (typeof field.fieldName !== "string") {
    return false;
  }

  if (typeof field.optional !== "boolean") {
    return false;
  }

  if (
    field.description !== undefined &&
    typeof field.description !== "string"
  ) {
    return false;
  }

  return true;
}

function isOnDemandTemplate(value: unknown): value is OnDemandTemplate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const template = value as Record<string, unknown>;
  if (typeof template.name !== "string") {
    return false;
  }

  if (!Array.isArray(template.fields)) {
    return false;
  }

  return template.fields.every(isOnDemandTemplateField);
}

export function parseOnDemandTemplateList(
  value: unknown,
): OnDemandTemplateList | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.templates)) {
    return null;
  }

  if (!record.templates.every(isOnDemandTemplate)) {
    return null;
  }

  return { templates: record.templates };
}
