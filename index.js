const TelegramBot = require('node-telegram-bot-api');

// 🔑 PON AQUÍ TU TOKEN NUEVO DE BOTFATHER
const token = '8977522670:AAHoF-iVaCRNoMJxdcNE22L5Og5bKmDNkiA';

// 👤 TU ID (ADMIN)
const ADMIN_ID = 8071793611;

const bot = new TelegramBot(token, { polling: true });

// estados
let step = {};
let order = {};

// 🟢 START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
`👋 Bienvenido a la tienda

🛍 Elige una opción:`,
  {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🛍 Ver producto", callback_data: "product" }],
        [{ text: "👨‍💻 Soporte", url: "https://t.me/MIAUGR9" }]
      ]
    }
  });
});

// 🛍 PRODUCTO Y COMPRA
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  // mostrar producto
  if (query.data === "product") {
    bot.sendMessage(chatId,
`🛍 Producto: Wax Premium
💰 Precio: $200 MXN`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🟢 COMPRAR", callback_data: "buy" }]
        ]
      }
    });
  }

  // iniciar compra
  if (query.data === "buy") {
    step[chatId] = "address";
    order[chatId] = {};

    bot.sendMessage(chatId,
`📦 Escribe tu dirección completa:
Nombre, calle, colonia, ciudad, CP, teléfono`);
  }

  bot.answerCallbackQuery(query.id);
});

// 📦 FLUJO DE COMPRA
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!step[chatId]) return;

  // dirección
  if (step[chatId] === "address") {
    order[chatId].address = text;
    step[chatId] = "payment";

    bot.sendMessage(chatId,
`💳 Métodos de pago:
Transferencia / PayPal / Depósito

📩 Envía tu comprobante`);
    return;
  }

  // comprobante
  if (step[chatId] === "payment") {
    order[chatId].proof = text;
    step[chatId] = "done";

    const orderId = Math.floor(Math.random() * 10000);

    // cliente
    bot.sendMessage(chatId,
`✅ Pedido confirmado
ID: #${orderId}
Un asesor te contactará 👨‍💻`);

    // admin (tú)
    bot.sendMessage(ADMIN_ID,
`🚨 NUEVO PEDIDO #${orderId}

👤 Usuario: ${chatId}

📦 Dirección:
${order[chatId].address}

💳 Comprobante:
${order[chatId].proof}`);
  }
});