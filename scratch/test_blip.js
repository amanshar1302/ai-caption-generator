const fs = require('fs');
const axios = require('axios');

async function testBLIP() {
  const base64Img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="; 
  const buffer = Buffer.from(base64Img, 'base64');
  
  try {
    const res = await axios.post(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      buffer,
      { headers: { "Content-Type": "application/octet-stream" } }
    );
    console.log("BLIP Result:", res.data);
  } catch(e) {
    if (e.response) {
      console.error("BLIP Error:", e.response.status, e.response.data);
    } else {
      console.error(e.message);
    }
  }
}

testBLIP();
