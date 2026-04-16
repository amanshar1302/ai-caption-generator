/**
 * Application Configuration
 * 
 * NOTE: These keys are baked into the build for deployment simplicity as requested.
 * Ensure this file is handled securely if the repository is public.
 */

export const APP_CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  TM_MODEL_URL: "https://teachablemachine.withgoogle.com/models/v_S1pZ7D2/",
  
  // n8n Webhooks
  N8N_WEBHOOK_URL: "http://localhost:5678/webhook/upload-image", // Update this for production n8n
  N8N_FETCH_WEBHOOK_URL: "http://localhost:5678/webhook/fetch-images",
  N8N_FEEDBACK_WEBHOOK_URL: "http://localhost:5678/webhook/update-feedback",
  
  // Database/Sheets
  GOOGLE_SHEETS_ID: "1crMJBOzcE2LxvURM_7qzZlIxRfxLAivA1KjQPQcLNLI"
};
