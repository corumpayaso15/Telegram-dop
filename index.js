const TelegramBot = require('node-telegram-bot-api');

const token = '8977522670:AAHoF-iVaCRNoMJxdcNE22L5Og5bKmDNkiA';
const ADMIN_ID = 8071793611;

const bot = new TelegramBot(token, { polling: true });

let state = {};
let order = {};

// 🟢 START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  state[chatId] = "MENU";

  bot.sendMessage(chatId,
`🏢 TIENDA OFICIAL`,
{
  reply_markup: {
    inline_keyboard: [
      [{ text: "🛍 Comprar", callback_data: "BUY" }],
      [{ text: "💬 Soporte", callback_data: "SUPPORT" }]
    ]
  }
});
});

// 🟢 BOTONES
bot.on('callback_query', (q) => {
  const chatId = q.message.chat.id;

  if (q.data === "BUY") {
    state[chatId] = "PRODUCT";
    order[chatId] = {};

    bot.sendMessage(chatId, "📦 Escribe el producto:");
  }

  if (q.data === "SUPPORT") {
    state[chatId] = "SUPPORT";

    bot.sendMessage(chatId, "💬 Escribe tu mensaje de soporte:");
  }

  bot.answerCallbackQuery(q.id);
});

// 🟢 MENSAJES (CONTROLADO BIEN)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/start')) return;

  const step = state[chatId];

  // 🔵 COMPRA
  if (step === "PRODUCT") {
    order[chatId].product = text;
    state[chatId] = "ADDRESS";

    return bot.sendMessage(chatId, "📍 Escribe tu dirección:");
  }

  if (step === "ADDRESS") {
    order[chatId].address = text;
    state[chatId] = "PAYMENT";

    // 🔥 AQUÍ SE ARREGLA TU PROBLEMA (transferencia SI SALE)
    return bot.sendMessage(chatId,
`💳 MÉTODOS DE PAGO

• Transferencia
• Depósito

Responde con tu opción`);
  }

  if (step === "PAYMENT") {
    order[chatId].payment = text;
    state[chatId] = "PROOF";

    return bot.sendMessage(chatId,
`🏦 DATOS PARA TRANSFERENCIA:

Cuenta: 728969000086679496
Banco: STP
Nombre: julio escalera ortiz
Concepto: Escolar

📩 Envía tu comprobante`);
  }

  if (step === "PROOF") {

    const id = Math.floor(Math.random() * 100000);

    bot.sendMessage(chatId,
`✅ Pedido recibido
🧾 ID: #${id}`);

    bot.sendMessage(ADMIN_ID,
`🚨 NUEVO PEDIDO #${id}

🛍 ${order[chatId].product}
📍 ${order[chatId].address}
💳 ${order[chatId].payment}
📩 ${text}`);

    state[chatId] = "MENU";
    return;
  }

  // 🔴 SOPORTE (ARREGLADO DE VERDAD)
  if (step === "SUPPORT") {

    const ticket = Math.floor(Math.random() * 100000);

    bot.sendMessage(chatId,
`✅ Soporte enviado
🧾 ID: #${ticket}`);

    bot.sendMessage(ADMIN_ID,
`💬 SOPORTE #${ticket}

👤 ${chatId}
📝 ${text}`);

    state[chatId] = "MENU";
  }
});