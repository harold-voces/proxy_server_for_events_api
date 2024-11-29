const express = require('express');
const axios = require('axios');
// const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Set CORS headers manually
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888'); // Allow your frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Specify allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204); // No Content
});

// Proxy route
app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.securevan.com/v4/events', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.APP_NAME}:${process.env.VUE_APP_API_KEY}`).toString('base64')}`,
      },
      params: req.query, // Forward query parameters from the client
    });

    console.log('API Response:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching events:', error.message);

    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
