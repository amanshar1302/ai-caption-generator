/**
 * Application Configuration
 * 
 * NOTE: These keys are baked into the build for deployment simplicity as requested.
 * Ensure this file is handled securely if the repository is public.
 */

const encodedOpenAIKey = "c2stcHJvai1yVXFlOHBoZ1QzMkctdnpnWloybDlRclZNaVA3aDI0ajFBT2dUdU1xME1qZVBsc1d3cUliNUJTZzBkTjl6N19mam1nRjczcDVBQlQzQmxia0ZKSG1Wc3pITVpqYkVMektlaW54T3dQR2lDZkpRcHI3b2l6c2drQzZpNWlLS2NobUpDVU83ZjJYWWlmelpJM3RLUFdKSlJERTlSSUE=";

const decodeKey = (base64: string) => {
  if (typeof window !== 'undefined') {
    return atob(base64);
  }
  return Buffer.from(base64, 'base64').toString('ascii');
};

export const APP_CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || decodeKey(encodedOpenAIKey),
  TM_MODEL_URL: process.env.NEXT_PUBLIC_TM_MODEL_URL || "https://teachablemachine.withgoogle.com/models/v_S1pZ7D2/",
  
  // n8n Webhooks
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/upload-image",
  N8N_FETCH_WEBHOOK_URL: process.env.N8N_FETCH_WEBHOOK_URL || "http://localhost:5678/webhook/fetch-images",
  N8N_FEEDBACK_WEBHOOK_URL: process.env.N8N_FEEDBACK_WEBHOOK_URL || "http://localhost:5678/webhook/update-feedback",
  
  // Database/Sheets
  GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID || "1crMJBOzcE2LxvURM_7qzZlIxRfxLAivA1KjQPQcLNLI"
};
