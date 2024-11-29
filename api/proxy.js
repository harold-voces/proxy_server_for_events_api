const axios = require('axios');

// Serverless function handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888'); // Adjust to your frontend origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers

  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // End the request for preflight
  }

  // Handle GET requests (proxy logic)
  if (req.method === 'GET') {
    try {
      const response = await axios.get('https://api.securevan.com/v4/events', {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.APP_NAME}:${process.env.VUE_APP_API_KEY}`).toString('base64')}`,
        },
        params: req.query, // Forward query parameters
      });

      console.log('API Response:', response.data);

      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching events:', error.message);

      return res
        .status(error.response?.status || 500)
        .json({ error: error.message });
    }
  }

  // For unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
