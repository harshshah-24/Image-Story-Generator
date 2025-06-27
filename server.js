const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit per image
});

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Route to handle multiple image uploads and story generation
app.post('/api/generate-story', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Analyze each image and collect descriptions
    const imageDescriptions = [];
    for (const file of req.files) {
      const imageData = fs.readFileSync(file.path);
      const imageBase64 = imageData.toString('base64');

      const imagePrompt = {
        inlineData: {
          data: imageBase64,
          mimeType: file.mimetype,
        },
      };

      const imageResult = await model.generateContent([
        'Describe the main elements in this image in a few words (e.g., objects, scenes, themes).',
        imagePrompt,
      ]);
      const imageDescription = imageResult.response.text();
      console.log(`Image Description (${file.filename}):`, imageDescription);
      imageDescriptions.push(imageDescription);
    }

    // Combine descriptions into a single story prompt
    const combinedDescription = imageDescriptions.join('; ');
    const storyPrompt = `Write a story (300-400) based on the following elements from multiple images: ${combinedDescription}. Start with "Once upon a time" and create a narrative that weaves together the elements from all images.`;

    console.log('Story Prompt:', storyPrompt);

    // Generate the story
    const storyResult = await model.generateContent(storyPrompt);
    const story = storyResult.response.text();

    // Generate a title based on the story text
    const titlePrompt = `Generate a short, creative title (3-6 words) for a story based on the following story text: "${story}. Only write a single line containing the title".`;
    const titleResult = await model.generateContent(titlePrompt);
    let title = titleResult.response.text();
    console.log('Generated Title:', title);

    // Ensure the title is under 7 words
    const titleWords = title.split(' ');
    if (titleWords.length > 6) {
      title = titleWords.slice(0, 6).join(' ');
    }

    // Return the story, title, and image URLs
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    res.json({
      story,
      title,
      imageUrls,
    });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'One or more images are too large (max 4MB each)' });
    }
    console.error('Error processing images:', error);
    res.status(500).json({ error: 'Failed to process images: ' + error.message });
  }
});

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});