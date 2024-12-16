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
      const page = parseInt(req.query.page, 10) || 0;
      const pageSize = 10;
      const skip = page * pageSize;

      // Add $count=true to the query to retrieve the total item count
      // NOTE: Check EveryAction docs if this is supported for the specific endpoint.
      const apiURL = `https://api.securevan.com/v4/events?codeIds=1027817&$expand=locations%2Ccodes&$top=${pageSize}&$skip=${skip}&$count=true`;

      const response = await axios.get(apiURL, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.APP_NAME}:${process.env.VUE_APP_API_KEY}`).toString('base64')}`
        },
        params: req.query,
      });

      // According to OData conventions, total count might be in @odata.count
      const items = response.data.items || [];
      const totalCount = response.data['@odata.count'] || 0; 

      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json({ 
        items: items,
        totalCount: totalCount 
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
