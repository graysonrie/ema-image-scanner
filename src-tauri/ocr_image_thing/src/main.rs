use std::error::Error;

use ocr_image_thing::ImageEvalClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let client = ImageEvalClient::new();

    let image_path = r"Z:\EMA\ROCKWALL\7 001 0079 020 ROCKWALL-HEATH CENTRAL PLANTS HVAC\PHOTOs\PHOTOs\Site Visit 01-13-26\Rockwall HS\20260113_102925.jpg";

    print!("Analyzing image");

    let output = client
        .evaluate_images(vec![image_path.to_string()], None, None)
        .await;

    println!("Received output: {output:#?}");

    Ok(())
}
