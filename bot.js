import TelegramBot from 'node-telegram-bot-api';
import { config } from './src/config.js';
import { MessageHandler } from './src/handlers/messageHandler.js';
import { parseYandexMusicUrl } from './src/utils/urlParser.js';

if (!config.telegramToken) {
  console.error('ERROR: Telegram bot token not found! Please set BOT_TOKEN in .env file');
  process.exit(1);
}

const bot = new TelegramBot(config.telegramToken, { polling: true });
const messageHandler = new MessageHandler(bot);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Welcome! Send me a Yandex Music link to a track, album, artist, or playlist, and I\'ll download it for you.'
  );
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text?.includes('music.yandex')) {
    return;
  }

  try {
    await bot.sendMessage(chatId, 'Processing your request...');

    const { type, id } = parseYandexMusicUrl(text);
    
    if (!type || !id) {
      await bot.sendMessage(
        chatId,
        'Invalid Yandex Music URL. Please send a valid link to a track, album, artist, or playlist.'
      );
      return;
    }

    switch (type) {
      case 'album':
        await messageHandler.handleAlbum(chatId, id);
        break;
      case 'track':
        await messageHandler.handleTrack(chatId, id);
        break;
      case 'playlist':
        await messageHandler.handlePlaylist(chatId, id);
        break;
      case 'artist':
        await messageHandler.handleArtist(chatId, id);
        break;
      default:
        await bot.sendMessage(
          chatId,
          'Unsupported content type. Please send a link to a track, album, artist, or playlist.'
        );
    }
  } catch (error) {
    console.error('Error:', error);
    await bot.sendMessage(
      chatId,
      `Sorry, an error occurred: ${error.message}`
    );
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
  if (error.code === 'ETELEGRAM' && error.message.includes('401')) {
    console.error('Invalid Telegram token! Please check your BOT_TOKEN in .env file');
    process.exit(1);
  }
});

console.log('Bot is starting...');