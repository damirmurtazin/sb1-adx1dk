import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { config } from '../config.js';

export class Downloader {
  constructor() {
    this.ensureDownloadsDirectory();
  }

  ensureDownloadsDirectory() {
    if (!fs.existsSync(config.downloadsDir)) {
      fs.mkdirSync(config.downloadsDir, { recursive: true });
    }
  }

  async downloadTrack(url, fileName) {
    const filePath = path.join(config.downloadsDir, fileName);

    try {
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      return filePath;
    } catch (error) {
      throw new Error(`Failed to download track: ${error.message}`);
    }
  }

  cleanup(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }
}