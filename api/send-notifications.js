const nodemailer = require('nodemailer');

// Email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
};

// Send Telegram message
async function sendTelegramMessage(orderData) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
        console.error('Telegram credentials missing');
        return false;
    }

    const message = `
🥚 NEW EGG ORDER!

Name: ${orderData.name}
Phone: ${orderData.phone}
Email: ${orderData.email || 'Not provided'}
Eggs: ${orderData.eggs === 'custom' ? orderData.customEggs + ' eggs (custom)' : orderData.eggs + ' eggs'}
Location: ${orderData.location}

Time: ${orderData.timestamp}
    `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });
        
        const result = await response.json();
        console.log('Telegram response:', result);
        
        return response.ok;
    } catch (error) {
        console.error('Telegram error:', error);
        return false;
    }
}

// Send email
async function sendEmail(orderData) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('Email credentials missing');
        return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // Send to yourself
        subject: `🥚 New Egg Order - ${orderData.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">🥚 New Egg Order Received</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <p><strong>Name:</strong> ${orderData.name}</p>
                    <p><strong>Phone:</strong> ${orderData.phone}</p>
                    <p><strong>Email:</strong> ${orderData.email || 'Not provided'}</p>
                    <p><strong>Eggs:</strong> ${orderData.eggs === 'custom' ? orderData.customEggs + ' eggs (custom)' : orderData.eggs + ' eggs'}</p>
                    <p><strong>Location:</strong> ${orderData.location}</p>
                    <p><strong>Time:</strong> ${orderData.timestamp}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

// Main function to send all notifications
async function sendNotifications(orderData) {
    try {
        const [emailResult, telegramResult] = await Promise.allSettled([
            sendEmail(orderData),
            sendTelegramMessage(orderData)
        ]);

        return {
            email: emailResult.status === 'fulfilled' ? emailResult.value : false,
            telegram: telegramResult.status === 'fulfilled' ? telegramResult.value : false
        };
    } catch (error) {
        console.error('Notification error:', error);
        return { email: false, telegram: false };
    }
}

module.exports = sendNotifications;