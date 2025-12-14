const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const router = express.Router();

// Inisialisasi WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});


let latestQR = null;

    // Update QR saat event trigger
    client.on('qr', (qr) => {
        latestQR = qr;
    });


// // QR CODE
// client.on('qr', (qr) => {
//   qrcode.generate(qr, { small: true });
//   console.log('Scan QR dengan WhatsApp');
// });

router.get('/', async (req, res) => {
        if (!latestQR) {
            return res.json({ success: true, message: 'Bot sudah login, QR tidak diperlukan' });
        }

        try {
            const qrDataUrl = await qrcode.toDataURL(latestQR);
            return res.json({ success: true, qr: qrDataUrl });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });


// READY
client.on('ready', () => {
  console.log('✅ WhatsApp Bot Siap Digunakan');
});

// PESAN MASUK (AMAN)
client.on('message', async (msg) => {

  // Abaikan grup
  if (msg.from.includes('@g.us')) return;

  const text = msg.body.toLowerCase();

  // Delay human-like
  const delay = Math.floor(Math.random() * 3000) + 2000;

  setTimeout(() => {
    if (text === 'halo' || text === 'hai') {
      msg.reply('Halo 👋 Ada yang bisa saya bantu?');
    }

    if (text === 'menu') {
      msg.reply(
`📌 MENU
1. Info
2. Bantuan
3. Kontak

Ketik angka menu`
      );
    }
  }, delay);
});

// START
client.initialize();

/**
 * Endpoint untuk mengirim pesan WA
 * POST /send-message
 * body: { number: "6281234567890", message: "Halo" }
 */
router.post('/', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ success: false, message: 'number & message required' });
  }

  const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

  try {
    const response = await client.sendMessage(chatId, message);
    return res.json({ success: true, response });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;