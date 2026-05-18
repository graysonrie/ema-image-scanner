use std::sync::Arc;

use async_openai::{Client, config::OpenAIConfig};
use futures::future::join_all;
use tokio::sync::Mutex;

use crate::{
    DEFAULT_OPENAI_MODEL, ImageEvaluationResult, evaluate_image as run_image_evaluation,
    evaluate_image_raw as run_raw_image_evaluation,
};

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ImageEvalResponse {
    /// The full path to the image that was evaluated
    pub full_image_path: String,
    /// The result of the evaluation if it was successful
    pub success_result: Option<ImageEvaluationResult>,
    /// The reason the evaluation failed if it was not successful
    pub failure_result: Option<String>,
}
#[derive(Clone)]
pub struct ImageEvalClient {
    inner: Arc<Mutex<Inner>>,
}
impl ImageEvalClient {
    /// Creates a default OpenAI Client that will read the OPENAI_API_KEY variable
    ///
    /// Uses GPT 4.1 Mini by default
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(Inner {
                openai_api_key: None,
                ai_model: DEFAULT_OPENAI_MODEL.to_string(),
            })),
        }
    }
    /// Sets the api key to be used for all requests
    pub async fn set_api_key(&self, api_key: &str) {
        let mut l = self.inner.lock().await;
        l.openai_api_key = Some(api_key.to_string());
    }
    /// Sets the OpenAI model to be used for all requests
    pub async fn set_openai_model(&self, model: &str) {
        let mut l = self.inner.lock().await;
        l.ai_model = model.to_string();
    }

    pub async fn evaluate_image_raw(
        &self,
        image_path: String,
        prompt: String,
        temperature: f32,
    ) -> Result<String, String> {
        let (api_key, model) = {
            let inner = self.inner.lock().await;
            (inner.openai_api_key.clone(), inner.ai_model.clone())
        };

        let client = match &api_key {
            Some(key) => Client::with_config(OpenAIConfig::new().with_api_key(key)),
            None => Client::new(),
        };

        run_raw_image_evaluation(&client, prompt, image_path, model, temperature).await
    }

    pub async fn evaluate_image(
        &self,
        image_path: String,
        custom_prompt: Option<String>,
        temperature: Option<f32>,
    ) -> ImageEvalResponse {
        let (api_key, model) = {
            let inner = self.inner.lock().await;
            (inner.openai_api_key.clone(), inner.ai_model.clone())
        };

        let full_image_path = image_path.clone();
        let client = match &api_key {
            Some(key) => Client::with_config(OpenAIConfig::new().with_api_key(key)),
            None => Client::new(),
        };
        let result =
            run_image_evaluation(&client, image_path, model, custom_prompt, temperature).await;

        match result {
            Ok(res) => ImageEvalResponse {
                full_image_path,
                success_result: Some(res),
                failure_result: None,
            },
            Err(err) => ImageEvalResponse {
                full_image_path,
                success_result: None,
                failure_result: Some(err.to_string()),
            },
        }
    }

    pub async fn evaluate_images(
        &self,
        image_paths: Vec<String>,
        custom_prompt: Option<String>,
        temperature: Option<f32>,
    ) -> Vec<ImageEvalResponse> {
        let client = self.clone();
        let futures = image_paths.into_iter().map(|image_path| {
            let client = client.clone();
            let prompt = custom_prompt.clone();
            async move { client.evaluate_image(image_path, prompt, temperature).await }
        });

        join_all(futures).await
    }
}

struct Inner {
    pub openai_api_key: Option<String>,
    pub ai_model: String,
}
