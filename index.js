const TelegramBot = require('node-telegram-bot-api');

const token = '8977522670:AAHoF-iVaCRNoMJxdcNE22L5Og5bKmDNkiA';
const ADMIN_ID = 8071793611;

const bot = new TelegramBot(token, { polling: true });

let step = {};
let order = {};

// 🟢 INICIO
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
`🏢 TIENDA OFICIAL

Seleccione una opción:`,
  {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🛍 Comprar producto", callback_data: "buy" }],
        [{ text: "💬 Soporte", callback_data: "support" }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  // 🛍 COMPRA
  if (query.data === "buy") {
    step[chatId] = "product";
    order[chatId] = {};

    bot.sendMessage(chatId,
`📦 Escriba el nombre del producto que desea comprar:`);
  }

  // 💬 SOPORTE (DIRECTO A CHAT ADMIN)
  if (query.data === "support") {
    step[chatId] = "support";

    bot.sendMessage(chatId,
`💬 SOPORTE

Escriba su duda o problema y será atendido.`);
  }

  bot.answerCallbackQuery(query.id);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!step[chatId]) return;

  // 📦 PRODUCTO
  if (step[chatId] === "product") {
    order[chatId].product = text;
    step[chatId] = "address";

    bot.sendMessage(chatId,
`📍 Escriba su dirección completa:`);
    return;
  }

  // 📍 DIRECCIÓN
  if (step[chatId] === "address") {
    order[chatId].address = text;
    step[chatId] = "payment";

    bot.sendMessage(chatId,
`💳 Método de pago:

• Transferencia
• Depósito

Escriba su opción:`);
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

📩 Envíe su comprobante de pago:`);
    return;
  }

  // 📩 COMPROBANTE → ADMIN
  if (step[chatId] === "proof") {

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

    step[chatId] = "done";
  }

  // 💬 SOPORTE DIRECTO A ADMIN
  if (step[chatId] === "support") {

    bot.sendMessage(chatId,
`✅ Su mensaje fue enviado a soporte.`);

    bot.sendMessage(ADMIN_ID,
`💬 NUEVO MENSAJE DE SOPORTE

👤 Usuario: ${chatId}

📝 Mensaje:
${text}`);

    step[chatId] = "done";
  }
});