const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function testUpload() {
  const form = new FormData();
  
  // Create a minimal 1x1 base64 GIF / image
  const base64Img = "R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
  const buffer = Buffer.from(base64Img, 'base64');
  
  form.append('images', buffer, {
    filename: 'test.gif',
    contentType: 'image/gif'
  });
  form.append('name', 'Test');

  console.log("Sending POST to http://localhost:3000/api/upload...");
  try {
    const start = Date.now();
    const res = await axios.post('http://localhost:3000/api/upload', form, {
      headers: {
        ...form.getHeaders(),
      }
    });
    console.log(`Success in ${Date.now() - start}ms`);
    console.log("Response data:\n", JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log("Error response:", err.response.status, err.response.data);
    } else {
      console.log("Error:", err.message);
    }
  }
}

testUpload();
