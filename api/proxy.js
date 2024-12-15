import axios from 'axios';

const handler = async (req, res) => {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-Token, X-Api-Version');
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page, 10) || 0; // Default to page 0 if not provided
      const pageSize = 10; // Number of events per page
      const skip = page * pageSize;

      const apiURL = `https://api.securevan.com/v4/events?codeIds=1027817&$expand=locations%2Ccodes&$top=${pageSize}&$skip=${skip}`;

      const response = await axios.get(apiURL, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.APP_NAME}:${process.env.VUE_APP_API_KEY}`).toString('base64')}`,
        },
        params: req.query,
      });

      console.log('API Response:', response.data);

      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Return the data. If `@odata.nextLink` exists, you can pass it along.
      // If the response does not have `@odata.nextLink`, you can infer the presence of more data
      // by the number of items returned.
      const items = response.data.items || [];
      const hasMore = items.length === pageSize; 
      // (Alternatively, use `response.data['@odata.nextLink']` if provided by the API.)

      return res.status(200).json({ 
        items: items,
        hasMore: hasMore,
        // If the API returns `@odata.nextLink`, you could include it here:
        // nextLink: response.data['@odata.nextLink'] || null
      });
    } catch (error) {
      console.error('Error fetching events:', error.message);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res
        .status(error.response?.status || 500)
        .json({ error: error.message });
    }
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(405).json({ error: 'Method not allowed' });
};

export default handler;
