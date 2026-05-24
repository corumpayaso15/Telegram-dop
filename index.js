const TelegramBot = require('node-telegram-bot-api');

const token = '8977522670:AAHoF-iVaCRNoMJxdcNE22L5Og5bKmDNkiA';
const ADMIN_ID = 8071793611;

const bot = new TelegramBot(token, { polling: true });

// 📦 estados separados
let state = {};
let order = {};

// 🟢 START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  state[chatId] = null;

  bot.sendMessage(chatId,
`🏢 TIENDA OFICIAL`,
{
  reply_markup: {
    inline_keyboard: [
      [{ text: "🛍 Comprar", callback_data: "buy" }],
      [{ text: "💬 Soporte", callback_data: "support" }]
    ]
  }
});
});

bot.on('callback_query', (q) => {
  const chatId = q.message.chat.id;

  if (q.data === "buy") {
    state[chatId] = "PRODUCT";
    order[chatId] = {};

    bot.sendMessage(chatId, "📦 Escribe el producto que deseas:");
  }

  if (q.data === "support") {
    state[chatId] = "SUPPORT";

    bot.sendMessage(chatId, "💬 Escribe tu duda o problema:");
  }

  bot.answerCallbackQuery(q.id);
});

// 📩 MENSAJES ORDENADOS
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!state[chatId]) return;

  // 🛍 PRODUCTO
  if (state[chatId] === "PRODUCT") {
    order[chatId].product = text;
    state[chatId] = "ADDRESS";

    return bot.sendMessage(chatId, "📍 Escribe tu dirección completa:");
  }

  // 📍 DIRECCIÓN
  if (state[chatId] === "ADDRESS") {
    order[chatId].address = text;
    state[chatId] = "PAYMENT";

    return bot.sendMessage(chatId,
`💳 Método de pago:
• Transferencia
• Depósito

Escribe tu opción:`);
  }

  // 💳 PAGO
  if (state[chatId] === "PAYMENT") {
    order[chatId].payment = text;
    state[chatId] = "PROOF";

    return bot.sendMessage(chatId,
`🏦 DATOS:

728969000086679496
Banco: STP
Nombre: julio escalera ortiz
Concepto: Escolar

📩 Envía tu comprobante`);
  }

  // 📩 COMPROBANTE
  if (state[chatId] === "PROOF") {

    const orderId = Math.floor(Math.random() * 100000);

    bot.sendMessage(chatId,
`✅ Pedido recibido
🧾 ID: #${orderId}`);

    bot.sendMessage(ADMIN_ID,
`🚨 NUEVO PEDIDO #${orderId}

🛍 Producto: ${order[chatId].product}

👤 Cliente: ${chatId}

📍 Dirección:
${order[chatId].address}

💳 Pago:
${order[chatId].payment}

📩 Comprobante:
${text}`);

    state[chatId] = null;
    return;
  }

  // 💬 SOPORTE (SEPARADO Y LIMPIO)
  if (state[chatId] === "SUPPORT") {

    bot.sendMessage(chatId, "✅ Mensaje enviado a soporte.");

    bot.sendMessage(ADMIN_ID,
`💬 SOPORTE

👤 Usuario: ${chatId}

📝 Mensaje:
${text}`);

    state[chatId] = null;
  }
});