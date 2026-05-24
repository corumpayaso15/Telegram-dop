const TelegramBot = require('node-telegram-bot-api');

const token = '8977522670:AAHoF-iVaCRNoMJxdcNE22L5Og5bKmDNkiA';
const ADMIN_ID = 8071793611;

const bot = new TelegramBot(token, { polling: true });

let state = {};
let order = {};

// 🟢 INICIO
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  state[chatId] = null;

  bot.sendMessage(chatId,
`🏢 TIENDA OFICIAL

Seleccione una opción:`,
{
  reply_markup: {
    inline_keyboard: [
      [{ text: "🛍 Comprar", callback_data: "buy" }],
      [{ text: "💬 Soporte", callback_data: "support" }]
    ]
  }
});
});

// 🟢 BOTONES
bot.on('callback_query', (q) => {
  const chatId = q.message.chat.id;

  // 🛍 COMPRA
  if (q.data === "buy") {
    state[chatId] = "PRODUCT";
    order[chatId] = {};

    bot.sendMessage(chatId,
`📦 Escribe el producto que deseas comprar:`);
  }

  // 💬 SOPORTE
  if (q.data === "support") {
    state[chatId] = "SUPPORT";

    bot.sendMessage(chatId,
`💬 SOPORTE

Escribe tu duda o problema y será enviado directamente al administrador.`);
  }

  bot.answerCallbackQuery(q.id);
});

// 🟢 FLUJO PRINCIPAL
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!state[chatId]) return;

  // 📦 PRODUCTO
  if (state[chatId] === "PRODUCT") {
    order[chatId].product = text;
    state[chatId] = "ADDRESS";

    return bot.sendMessage(chatId,
`📍 Escribe tu dirección completa:`);
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
`🏦 DATOS BANCARIOS:

Cuenta: 728969000086679496
Banco: STP
Nombre: julio escalera ortiz
Concepto: Escolar

📩 Envía tu comprobante de pago`);
  }

  // 📩 COMPROBANTE → ADMIN
  if (state[chatId] === "PROOF") {

    const orderId = Math.floor(Math.random() * 100000);

    bot.sendMessage(chatId,
`✅ Pedido confirmado

🧾 ID: #${orderId}
📦 En revisión`);

    bot.sendMessage(ADMIN_ID,
`🚨 NUEVO PEDIDO #${orderId}

🛍 Producto:
${order[chatId].product}

👤 Cliente:
${chatId}

📍 Dirección:
${order[chatId].address}

💳 Pago:
${order[chatId].payment}

📩 Comprobante:
${text}`);

    state[chatId] = null;
    return;
  }

  // 💬 SOPORTE DIRECTO A TI
  if (state[chatId] === "SUPPORT") {

    const ticketId = Math.floor(Math.random() * 100000);

    bot.sendMessage(chatId,
`✅ Mensaje enviado a soporte

🧾 ID: #${ticketId}`);

    bot.sendMessage(ADMIN_ID,
`💬 SOPORTE

🧾 ID: #${ticketId}

👤 Usuario:
${chatId}

📝 Mensaje:
${text}`);

    state[chatId] = null;
  }
});