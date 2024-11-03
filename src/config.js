import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  telegramToken: process.env.BOT_TOKEN,
  downloadsDir: join(__dirname, '..', 'downloads'),
  yandexApi: {
    baseUrl: 'https://api.music.yandex.net'
  }
};