# AuraCaption AI Dashboard

A premium, production-ready AI image analysis and caption generation platform built with Next.js 15, Gemini Vision, and n8n orchestration.

## 🚀 Key Features

- **Multi-Model AI Vision**: Automatically analyzes images using **GPT-4o Vision** or **Gemini 1.5** with intelligent failover.
- **Real-Time Progress Tracking**: Animated step-by-step progress checklist for high transparency during AI analysis.
- **Graceful Fallback**: Visual heuristic engine provides "Estimated Captions" if AI quotas are exceeded.
- **Modern UI/UX**: Clean, minimal, light-themed interface with vibrant accents and smooth animations.
- **Netlify Ready**: Optimized build pipeline for stable production deployment with native dependency support.

## 🛠️ Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with the following keys:

```bash
# AI Provider Keys
GEMINI_API_KEY=your_google_ai_studio_key
OPENAI_API_KEY=your_openai_api_key

# Teachable Machine (Optional for Custom Classification)
NEXT_PUBLIC_TM_MODEL_URL=https://teachablemachine.withgoogle.com/models/your-id/

# n8n Webhook Endpoints
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/upload-image
N8N_FETCH_WEBHOOK_URL=https://your-n8n-instance/webhook/fetch-images
N8N_FEEDBACK_WEBHOOK_URL=https://your-n8n-instance/webhook/update-feedback
```

### 2. n8n Workflow
1. Import the provided `n8n_workflow_template.json` into your n8n instance.
2. Update the Google Sheets node with your specific `Sheet ID`.
3. Configure your credentials for OpenAI and Google Workspace within n8n.

### 3. Local Development
```bash
npm install
npm run dev
```

### 4. Deployment on Netlify (Recommended)

### Netlify Pre-Deployment Verification
Before pushing to production, verify the following:
1. **Next.js Version**: Confirmed `15.0.3` for compatibility.
2. **ESLint**: Aligned `eslint-config-next` to `15.0.3`.
3. **Internal Routing**: Removed internal HTTP proxy calls to prevent Netlify Function timeouts; routes now call shared logic directly.
4. **AI Models**: Using `gemini-1.5-flash` for high availability.

### How to Deploy
1. Push these changes to your `main` branch.
2. Link your repository to a new site on Netlify.
3. Configure the **Environment Variables** listed above.
4. Trigger the build.

2.  **Node Version**: The project requires **Node.js 20**. This is already set in `netlify.toml`.
3.  **Functions Configuration**:
    *   The `netlify.toml` automatically includes the `canvas` module in `external_node_modules` for image processing support in Netlify Functions.
    *   Ensure your `NODE_VERSION` in Netlify is set to `20` to match the build environment.
4.  **Build Command**: `npm run build` (Target directory: `.next`)

## 🛡️ Git Hygiene

- `.gitignore` is configured to exclude all `.env` files and build artifacts.
- Sensitive logic is proxied through n8n to avoid exposing service account keys in the frontend.

---

Built with ❤️ for the FOAI Capstone Project.
