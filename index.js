const TelegramBot = require('node-telegram-bot-api');

const token = '8977522670:AAHoF-iVaCRNoMJxdcNE22L5Og5bKmDNkiA';
const ADMIN_ID = 8071793611;

const bot = new TelegramBot(token, { polling: true });

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
      [{ text: "🛍 Comprar", callback_data: "BUY" }],
      [{ text: "💬 Soporte", url: "https://t.me/julioescaleraortiz" }]
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

    bot.sendMessage(chatId, "📦 Escribe el producto que deseas:");
  }

  // 💰 PAGO TRANSFERENCIA
  if (q.data === "TRANSFERENCIA") {
    order[chatId].payment = "Transferencia";
    state[chatId] = "PROOF";

    return bot.sendMessage(chatId,
`🏦 DATOS PARA TRANSFERENCIA:

Cuenta: 728969000086679496
Banco: STP
Nombre: julio escalera ortiz
Concepto: Escolar

📩 Envía tu comprobante`);
  }

  // 🏧 PAGO DEPÓSITO
  if (q.data === "DEPOSITO") {
    order[chatId].payment = "Depósito";
    state[chatId] = "PROOF";

    return bot.sendMessage(chatId,
`🏦 DATOS PARA DEPÓSITO:

Cuenta: 728969000086679496
Banco: STP
Nombre: julio escalera ortiz
Concepto: Escolar

📩 Envía tu comprobante`);
  }

  bot.answerCallbackQuery(q.id);
});

// 🟢 FLUJO PRINCIPAL
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/start')) return;

  const step = state[chatId];

  // 📦 PRODUCTO
  if (step === "PRODUCT") {
    order[chatId].product = text;
    state[chatId] = "ADDRESS";

    return bot.sendMessage(chatId, "📍 Escribe tu dirección completa:");
  }

  // 📍 DIRECCIÓN → BOTONES DE PAGO
  if (step === "ADDRESS") {
    order[chatId].address = text;
    state[chatId] = "PAYMENT";

    return bot.sendMessage(chatId,
`💳 Selecciona método de pago:`,
{
  reply_markup: {
    inline_keyboard: [
      [{ text: "💰 Transferencia", callback_data: "TRANSFERENCIA" }],
      [{ text: "🏧 Depósito", callback_data: "DEPOSITO" }]
    ]
  }
});
  }

  // 📩 COMPROBANTE → ADMIN
  if (step === "PROOF") {

    const id = Math.floor(Math.random() * 100000);

    bot.sendMessage(chatId,
`✅ Pedido confirmado
🧾 ID: #${id}`);

    bot.sendMessage(ADMIN_ID,
`🚨 NUEVO PEDIDO #${id}

🛍 Producto:
${order[chatId].product}

📍 Dirección:
${order[chatId].address}

💳 Método:
${order[chatId].payment}

📩 Comprobante:
${text}`);

    state[chatId] = null;
  }
});