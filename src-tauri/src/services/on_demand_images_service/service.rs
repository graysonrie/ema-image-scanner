use ocr_image_thing::ImageEvalClient;

use crate::services::on_demand_images_service::models::OnDemandTemplate;

pub struct OnDemandImagesService {
    client: ImageEvalClient,
}

impl OnDemandImagesService {
    pub fn new(client: ImageEvalClient) -> Self {
        Self { client }
    }

    pub async fn evaluate_selected(
        &self,
        image_path: String,
        active_template: &OnDemandTemplate,
        openai_api_key: &str,
    ) -> Result<String, String> {
        self.client.set_api_key(openai_api_key).await;

        let temperature = 0.8;
        let prompt = self.create_prompt_with_template(active_template);

        self.client
            .evaluate_image_raw(image_path, prompt, temperature)
            .await
    }

    fn create_prompt_with_template(&self, template: &OnDemandTemplate) -> String {
        let mut prompt = String::from(
            "Analyze the image and extract equipment information for the template below.\n\
             Read labels, nameplates, and any visible identifiers in the image.\n\
             If a required field cannot be determined from the image, respond with \"Unknown\" for that field.\n\
             If an optional field cannot be determined, omit that line entirely.\n\n",
        );

        prompt.push_str(&format!(
            "Template: {}\n\nFields to extract:\n",
            template.name
        ));

        for field in &template.fields {
            let requirement = if field.optional {
                "optional"
            } else {
                "required"
            };

            prompt.push_str(&format!("- {} ({})", field.field_name, requirement));

            if let Some(description) = field.description.as_ref().filter(|d| !d.trim().is_empty()) {
                prompt.push_str(&format!(": {}", description.trim()));
            }

            prompt.push('\n');
        }

        prompt.push_str(
            "\nRespond with plain text only, using exactly this format (one \"FieldName: value\" line per field):\n",
        );

        for field in &template.fields {
            prompt.push_str(&format!("{}: \n", field.field_name));
        }

        prompt.push_str(
            "\nDo not include markdown, code fences, JSON, or any text before or after the field lines.",
        );

        prompt
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::on_demand_images_service::models::OnDemandTemplateField;

    fn rtu_template() -> OnDemandTemplate {
        OnDemandTemplate {
            name: "RTU".to_string(),
            fields: vec![
                OnDemandTemplateField {
                    field_name: "Tag".to_string(),
                    optional: false,
                    description: None,
                },
                OnDemandTemplateField {
                    field_name: "Make".to_string(),
                    optional: false,
                    description: None,
                },
                OnDemandTemplateField {
                    field_name: "Model #".to_string(),
                    optional: false,
                    description: None,
                },
                OnDemandTemplateField {
                    field_name: "Volt/Ph".to_string(),
                    optional: false,
                    description: Some("Use the format Voltage/Phase".to_string()),
                },
                OnDemandTemplateField {
                    field_name: "Heat Type".to_string(),
                    optional: false,
                    description: Some("Example: Natural Gas".to_string()),
                },
            ],
        }
    }

    #[test]
    fn prompt_includes_template_fields_and_output_format() {
        let service = OnDemandImagesService::new(ImageEvalClient::new());
        let prompt = service.create_prompt_with_template(&rtu_template());

        assert!(prompt.contains("Template: RTU"));
        assert!(prompt.contains("- Tag (required)"));
        assert!(prompt.contains("- Volt/Ph (required): Use the format Voltage/Phase"));
        assert!(prompt.contains("- Heat Type (required): Example: Natural Gas"));
        assert!(prompt.contains("Tag: \n"));
        assert!(prompt.contains("Model #: \n"));
        assert!(prompt.contains("plain text only"));
    }
}
