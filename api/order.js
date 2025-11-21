const sendNotifications = require('./send-notifications');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const orderData = req.body;
        
        console.log('Received order:', orderData);

        // Validate required fields
        if (!orderData.name || !orderData.phone || !orderData.location) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name, phone, location' 
            });
        }

        // Send notifications
        const notificationResult = await sendNotifications(orderData);

        console.log('Notification result:', notificationResult);

        res.status(200).json({ 
            success: true, 
            message: 'Order received successfully',
            notifications: notificationResult
        });

    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
