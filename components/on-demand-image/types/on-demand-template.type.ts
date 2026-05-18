export interface OnDemandTemplate {
  name: string;
  fields: OnDemandTemplateField[];
}

export interface OnDemandTemplateField {
  fieldName: string;
  optional: boolean;
  description?: string;
}
