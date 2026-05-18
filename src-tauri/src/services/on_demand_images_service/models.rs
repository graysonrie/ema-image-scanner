#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OnDemandTemplate {
    pub name: String,
    pub fields: Vec<OnDemandTemplateField>,
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OnDemandTemplateField {
    pub field_name: String,
    /// The description is addintional instructions for how the model should evaluate this field
    pub description: Option<String>,
    pub optional: bool,
}
