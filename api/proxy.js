// The code I am submitting is entirely my own work. 
// The project contains commits from two GitHub accounts: my personal account and my organization’s developer account. 
// Both accounts belong to me. 

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
      const page = parseInt(req.query.page, 10) || 1; // Default to page 0 if not provided
      const pageSize = 10; // Number of events per page
      const skip = (page -1 ) * pageSize;

      const nowUTC = new Date();
      const utcYear = nowUTC.getUTCFullYear();
      const utcMonth = String(nowUTC.getUTCMonth() + 1).padStart(2, '0');
      const utcDay = String(nowUTC.getUTCDate()).padStart(2, '0');

      const utcFormattedDate = `${utcYear}-${utcMonth}-${utcDay}`;

      const apiURL = `https://api.securevan.com/v4/events?codeIds=1027817&startingAfter=${utcFormattedDate}&$expand=locations%2Ccodes&$top=${pageSize}&$skip=${skip}`;

      const response = await axios.get(apiURL, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.APP_NAME}:${process.env.VUE_APP_API_KEY}`).toString('base64')}`,
        },
        params: req.query,
      });

      console.log('API Response:', response.data);

      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');

      let items = response.data.items || [];
      // Sort by startDate (ascending: earliest first)
      items.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      const count = response.data.count;
      const nextLink = response.data.nextPageLink;
      const hasMore = page * pageSize < count;

      return res.status(200).json({
        items,
        count,
        nextLink,
        hasMore,
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
