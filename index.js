const TelegramBot = require('node-telegram-bot-api');

// 🔑 TOKEN
const token = '8977522670:AAHoF-iVaCRNoMJxdcNE22L5Og5bKmDNkiA';

// 👤 ADMIN / DIRECTIVO
const ADMIN_ID = 8071793611;

const bot = new TelegramBot(token, { polling: true });

let step = {};
let order = {};

// 🟢 START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
`🏢 Bienvenido a la tienda oficial`,
{
  reply_markup: {
    inline_keyboard: [
      [{ text: "🛍 Comprar", callback_data: "shop" }],
      [{ text: "💬 Soporte", callback_data: "support" }]
    ]
  }
});
});

// 🟢 BOTONES
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  // 🛍 TIENDA
  if (query.data === "shop") {
    step[chatId] = "address";
    order[chatId] = {};

    bot.sendMessage(chatId,
`📦 Escribe el producto que deseas comprar:`);
  }

  // 💬 SOPORTE
  if (query.data === "support") {
    step[chatId] = "support";

    bot.sendMessage(chatId,
`💬 SOPORTE

Escribe tu problema o duda.`);
  }

  bot.answerCallbackQuery(query.id);
});

// 📦 FLUJO GENERAL
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!step[chatId]) return;

  // 🛍 PRODUCTO
  if (step[chatId] === "address" && !order[chatId].product) {
    order[chatId].product = text;

    bot.sendMessage(chatId,
`📍 Escribe tu dirección completa:`);
    return;
  }

  // 📍 DIRECCIÓN
  if (step[chatId] === "address" && order[chatId].product) {
    order[chatId].address = text;
    step[chatId] = "payment";

    bot.sendMessage(chatId,
`💳 Método de pago:

• transferencia
• deposito

Escribe tu opción:`);
    return;
  }

  // 💳 PAGO
  if (step[chatId] === "payment") {
    order[chatId].payment = text;
    step[chatId] = "proof";

    bot.sendMessage(chatId,
`🏦 DATOS BANCARIOS:

Cuenta: 728969000086679496
Banco: STP
Nombre: julio escalera ortiz
Concepto: Escolar

📩 Envía tu comprobante`);
    return;
  }

  // 📩 COMPROBANTE → ADMIN
  if (step[chatId] === "proof") {

    order[chatId].proof = text;
    step[chatId] = "done";

    const orderId = Math.floor(Math.random() * 100000);

    // 👤 CLIENTE
    bot.sendMessage(chatId,
`✅ Pedido confirmado

🧾 ID: #${orderId}
📦 Producto: ${order[chatId].product}`);

    // 👨‍💼 ADMIN
    bot.sendMessage(ADMIN_ID,
`🚨 NUEVO PEDIDO #${orderId}

🛍 Producto: ${order[chatId].product}

👤 Cliente: ${chatId}

📍 Dirección:
${order[chatId].address}

💳 Pago:
${order[chatId].payment}

📩 Comprobante:
${order[chatId].proof}`);
  }

  // 💬 SOPORTE
  if (step[chatId] === "support") {

    const ticketId = Math.floor(Math.random() * 100000);

    bot.sendMessage(chatId,
`✅ Ticket enviado

🧾 ID: #${ticketId}
📩 Te responderemos pronto`);

    bot.sendMessage(ADMIN_ID,
`💬 NUEVO TICKET #${ticketId}

👤 Usuario: ${chatId}

📝 Mensaje:
${text}`);
  }
});