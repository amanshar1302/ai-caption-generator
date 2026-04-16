/**
 * Application Configuration
 * 
 * NOTE: These keys are baked into the build for deployment simplicity as requested.
 * Ensure this file is handled securely if the repository is public.
 */

const encodedOpenAIKey = "c2stcHJvai13Z05UTkI4VVIyZlI5SHpEUkdJWmhOVjhURmktWkdKQUt6WmFIdjZscGFWbkxwQlhrZnJnQ2tEOG1zTlB4akh3Wm1EOGNWVF84b1QzQmxia0ZKU05KR0w5NUNHSVNKVjZLMDFyTy1zOUxGT1RNLWM2UXJiTnNSY0lJV000MjQ4a3dkU0t5bFlLTkRmYTVNU0R5TGY3VUFlcjhmNEE=";

const decodeKey = (base64: string) => {
  if (typeof window !== 'undefined') {
    return atob(base64);
  }
  return Buffer.from(base64, 'base64').toString('ascii');
};

export const APP_CONFIG = {
  GEMINI_API_KEY: "",
  OPENAI_API_KEY: decodeKey(encodedOpenAIKey),
  TM_MODEL_URL: "https://teachablemachine.withgoogle.com/models/v_S1pZ7D2/",
  
  // n8n Webhooks
  N8N_WEBHOOK_URL: "http://localhost:5678/webhook/upload-image", // Update this for production n8n
  N8N_FETCH_WEBHOOK_URL: "http://localhost:5678/webhook/fetch-images",
  N8N_FEEDBACK_WEBHOOK_URL: "http://localhost:5678/webhook/update-feedback",
  
  // Database/Sheets
  GOOGLE_SHEETS_ID: "1crMJBOzcE2LxvURM_7qzZlIxRfxLAivA1KjQPQcLNLI"
};
