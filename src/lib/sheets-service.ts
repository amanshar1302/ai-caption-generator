import axios from 'axios';

const MOCK_IMAGES = [
  {
    id: "mock1",
    timestamp: new Date().toISOString(),
    submitterName: "AI System",
    fileName: "misty-mountains.jpg",
    imageUrl: "/mock/nature.png",
    category: "Nature",
    confidence: "98.5",
    descriptiveCaption: "A breathtaking cinematic shot of a misty mountain range at sunrise. Vibrant purples and golds in the sky.",
    creativeCaption: "Where the earth meets the heavens in a silent dance of light and shadow.",
    accessibilityCaption: "Scenic view of sharp mountain peaks shrouded in fog under a purple and orange sunrise.",
    tags: ["nature", "mountain", "sunrise", "scenic"],
    source: "web",
    rating: 5,
    feedback: "Stunning analysis!"
  },
  {
    id: "mock2",
    timestamp: new Date().toISOString(),
    submitterName: "AI System",
    fileName: "gourmet-plating.jpg",
    imageUrl: "/mock/food.png",
    category: "Food",
    confidence: "99.2",
    descriptiveCaption: "A luxury gourmet dish, beautifully plated on dark stone with vibrant green garnishes.",
    creativeCaption: "A masterpiece of culinary art, where every ingredient tells a story of passion and precision.",
    accessibilityCaption: "Close-up of a sophisticated meat dish with green puree and microgreens on a black plate.",
    tags: ["food", "luxury", "gourmet", "plating"],
    source: "web",
    rating: 4.8,
    feedback: "Looks delicious!"
  }
];

export async function getImages() {
  try {
    const n8nFetchUrl = process.env.N8N_FETCH_WEBHOOK_URL;
    
    if (!n8nFetchUrl) {
      console.warn("N8N_FETCH_WEBHOOK_URL not configured. Using mock data.");
      return MOCK_IMAGES;
    }

    const response = await axios.get(n8nFetchUrl);
    
    // Check if n8n returned an error or empty data
    if (!response.data || !Array.isArray(response.data)) {
      console.warn("Unexpected response from n8n. Using mock data.");
      return MOCK_IMAGES;
    }

    return response.data.map((item: any, index: number) => ({
      id: item.id || `img-${index}`,
      timestamp: item.timestamp || new Date().toISOString(),
      submitterName: item.submitterName || "Unknown",
      fileName: item.fileName,
      imageUrl: item.imageUrl,
      category: item.category,
      confidence: item.confidence,
      descriptiveCaption: item.descriptiveCaption,
      creativeCaption: item.creativeCaption,
      accessibilityCaption: item.accessibilityCaption,
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map((t: string) => t.trim()) : []),
      source: item.source || 'n8n',
      rating: item.rating ? parseFloat(item.rating) : null,
      feedback: item.feedback || '',
    }));
  } catch (error) {
    console.error("N8N Fetch error, using mock data:", error);
    return MOCK_IMAGES;
  }
}

export async function updateFeedback(fileName: string, rating: number, feedback: string) {
  try {
    const n8nFeedbackUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL;

    if (!n8nFeedbackUrl) {
      console.warn("N8N_FEEDBACK_WEBHOOK_URL not configured. Mock update triggered.");
      return;
    }

    await axios.post(n8nFeedbackUrl, {
      fileName,
      rating,
      feedback,
    });
  } catch (error) {
    console.warn("N8N Feedback update failed.", error);
  }
}
