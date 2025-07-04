require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true, });

let users: { byId: Record<string, any>, allIds: Array<number> } = { byId: {}, allIds: [] };
let groups: { byId: Record<string, Array<string>>, allIds: Array<number> } = { byId: {}, allIds: [] };
let pendingMessages = {};

// Load users from storage
try {
    const obj = JSON.parse(fs.readFileSync('storage.json', 'utf8'));
    if (obj?.users) users = obj?.users
    if (obj?.groups) groups = obj?.groups
} catch (_) {
}

function saveUsers() {
    fs.writeFileSync('storage.json', JSON.stringify({
        users,
        groups,
    }, null, 2));
}

bot.onText(/^\/register/, (msg) => {
    if (msg.chat.type !== 'group') {
        return bot.sendMessage('Can only be used in groups')
    }

    const groupId = msg.chat.id;
    const user = msg.from;

    if (!users.byId[user.id]) {
        users.byId[user.id] = user
        users.allIds.push(user.id)
    }
    if (!groups.byId[groupId]) {
        groups.byId[groupId] = []
        groups.allIds.push(groupId)
    }
    // tood uniq
    groups.byId[groupId].push(user.id)
    groups.byId[groupId] = [...new Set(groups.byId[groupId])]

    saveUsers();

    bot.sendMessage(groupId, `✅ Registered". You can now use /send with me (@anoningroupbot) to message and receive anonymously.`);
});

bot.on('message', (msg) => {
    if (msg.chat.type !== 'private') return;

    const senderId = msg.chat.id;

    const recipientOptions = new Set<string>()

    for (let gidnum of groups.allIds) {
        const gid = `${gidnum}`
        const gUsers = groups.byId[gid]

        if (gUsers.some(memberId => memberId === senderId)) {
            gUsers.forEach(memberId => { if (memberId !== senderId) recipientOptions.add(memberId) })
        }
    }

    const buttons: any[] = [];
    const tmp: any[] = [];
    for (const uid of recipientOptions) {
        tmp.push({
            text: `${users.byId[uid]?.first_name} ${users.byId[uid]?.last_name}`,
            callback_data: `sendto_${uid}`,
        })
        if (tmp.length === 2) {
            buttons.push([...tmp])
            tmp.splice(0, 2)
        }
    }
    if (tmp.length === 1) buttons.push([...tmp])

    buttons.push([{ text: "❌ Cancel", callback_data: "cancel_send" }]);

    console.log('message buttons', buttons)

    bot.sendMessage(senderId, "👤 Who do you want to message anonymously?", {
        reply_markup: {
            inline_keyboard: buttons,
        },
    });

    pendingMessages[senderId] = msg.text
});

bot.on('callback_query', (callbackQuery) => {
    const senderId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (data.startsWith('sendto_')) {
        const userId = data.split('_')[1];
        const recipient = users.byId[userId]

        if (!recipient) {
            return bot.sendMessage(senderId, "❗ User not found.");
        }

        bot.sendMessage(recipient.id, `You have a private message:\n ${pendingMessages[senderId]}`);
        bot.sendMessage(senderId, `✉️ Your message was successfuly sent to ${recipient.first_name}`);
        delete pendingMessages[senderId]
    } else if (data === 'cancel_send') {
        bot.sendMessage(senderId, "❌ Message cancelled.");
    }

    bot.answerCallbackQuery(callbackQuery.id);
});