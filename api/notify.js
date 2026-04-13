export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, contact, url } = req.body;

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const text = `🚀 *Новая заявка WBReply AI*\n\n👤 *Имя:* ${name}\n📱 *Контакт:* ${contact}\n🌍 *Страница:* ${url}`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Telegram API error:', error);
            return res.status(500).json({ message: 'Failed to send Telegram message' });
        }

        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Notify error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
