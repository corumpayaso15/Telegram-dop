const TelegramBot = require('node-telegram-bot-api');

// 🔑 TOKEN NUEVO
const token = '8977522670:AAHoF-iVaCRNoMJxdcNE22L5Og5bKmDNkiA';

// 👤 ADMIN (TE LLEGAN PEDIDOS)
const ADMIN_ID = 8071793611;

const bot = new TelegramBot(token, { polling: true });

let step = {};
let order = {};

// 🟢 INICIO
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
`🏢 Bienvenido a nuestra tienda

Selecciona una opción:`,
  {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🛍 Ver catálogo",
            web_app: { url: "https://cdpn.io/pen/debug/VYmzpdM?authentication_hash=LDAmdmBLVQnr" }
          }
        ],
        [
          { text: "👨‍💻 Soporte", url: "https://t.me/julioescaleraortiz" }
        ]
      ]
    }
  });
});

// 🛒 INICIO COMPRA (desde web o botón)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  if (query.data === "buy") {
    step[chatId] = "address";
    order[chatId] = {};

    bot.sendMessage(chatId,
`📍 Dirección de envío:

Nombre completo
Calle y número
Colonia
Ciudad
Código postal
Teléfono`);
  }

  bot.answerCallbackQuery(query.id);
});

// 📦 FLUJO COMPLETO
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!step[chatId]) return;

  // 📍 DIRECCIÓN
  if (step[chatId] === "address") {
    order[chatId].address = text;
    step[chatId] = "payment";

    bot.sendMessage(chatId,
`💳 MÉTODOS DE PAGO:

• Transferencia bancaria
• PayPal
• Depósito

📩 Envía tu comprobante de pago`);
    return;
  }

  // 💳 COMPROBANTE
  if (step[chatId] === "payment") {
    order[chatId].proof = text;
    step[chatId] = "done";

    const orderId = Math.floor(Math.random() * 100000);

    // 👤 CLIENTE
    bot.sendMessage(chatId,
`✅ Pedido confirmado

🧾 ID: #${orderId}
📦 En breve te contactaremos`);

    // 👨‍💻 ADMIN (TE LLEGA A TI)
    bot.sendMessage(ADMIN_ID,
`🚨 NUEVO PEDIDO #${orderId}

👤 Cliente: ${chatId}

📍 Dirección:
${order[chatId].address}

💳 Comprobante:
${order[chatId].proof}`);
  }
});