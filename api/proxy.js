import axios from 'axios';

// Serverless function handler
const handler = async (req, res) => {
  // Handle OPTIONS preflight request
//   if (req.method === 'OPTIONS') {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-Token, X-Api-Version');
//     return res.status(200).end(); // Ensure the preflight request ends with a 200 status
//   }

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

      // Add CORS headers to the response
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching events:', error.message);

      // Add CORS headers to the error response
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res
        .status(error.response?.status || 500)
        .json({ error: error.message });
    }
  }

  // For unsupported methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(405).json({ error: 'Method not allowed' });
};

export default handler;
