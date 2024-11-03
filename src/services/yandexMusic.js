import axios from 'axios';
import { config } from '../config.js';

export class YandexMusicService {
  constructor() {
    this.baseUrl = 'https://music.yandex.ru/api';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive'
    };
    this.axiosInstance = axios.create({
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: status => status >= 200 && status < 300
    });
  }

  async retryRequest(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  async getArtistInfo(artistId) {
    return this.retryRequest(async () => {
      try {
        const response = await this.axiosInstance.get(
          `${this.baseUrl}/v2.1/handlers/artist/${artistId}/tracks`,
          { headers: this.headers }
        );
        
        if (!response.data?.tracks) {
          throw new Error('Artist not found');
        }

        return {
          id: artistId,
          tracks: response.data.tracks
        };
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error('Artist not found');
        }
        throw new Error(`Failed to get artist info: ${error.message}`);
      }
    });
  }

  async getTrackInfo(trackId) {
    return this.retryRequest(async () => {
      try {
        const response = await this.axiosInstance.get(
          `${this.baseUrl}/v2.1/handlers/track/${trackId}`,
          { headers: this.headers }
        );
        
        if (!response.data?.track) {
          throw new Error('Track not found');
        }

        return {
          id: trackId,
          title: response.data.track.title,
          artists: response.data.track.artists
        };
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error('Track not found');
        }
        throw new Error(`Failed to get track info: ${error.message}`);
      }
    });
  }

  async getDownloadUrl(trackId) {
    return this.retryRequest(async () => {
      try {
        const infoResponse = await this.axiosInstance.get(
          `${this.baseUrl}/v2.1/handlers/track/${trackId}/download-info/m?hq=1`,
          { headers: this.headers }
        );

        if (!infoResponse.data?.downloadInfo) {
          throw new Error('Download info not available');
        }

        const downloadResponse = await this.axiosInstance.get(
          `${this.baseUrl}/v2.1/handlers/track/${trackId}/download-info`,
          { headers: this.headers }
        );

        if (!downloadResponse.data?.downloadInfoUrl) {
          throw new Error('Download URL not available');
        }

        return downloadResponse.data.downloadInfoUrl;
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error('Track download info not found');
        }
        throw new Error(`Failed to get download URL: ${error.message}`);
      }
    });
  }

  async getAlbumInfo(albumId) {
    return this.retryRequest(async () => {
      try {
        const response = await this.axiosInstance.get(
          `${this.baseUrl}/v2.1/handlers/album/${albumId}`,
          { headers: this.headers }
        );

        if (!response.data?.volumes) {
          throw new Error('Album not found');
        }

        return {
          id: albumId,
          title: response.data.title,
          volumes: response.data.volumes
        };
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error('Album not found');
        }
        throw new Error(`Failed to get album info: ${error.message}`);
      }
    });
  }

  async getPlaylistInfo(playlistId) {
    return this.retryRequest(async () => {
      try {
        const response = await this.axiosInstance.get(
          `${this.baseUrl}/v2.1/handlers/playlist/${playlistId}`,
          { headers: this.headers }
        );

        if (!response.data?.tracks) {
          throw new Error('Playlist not found');
        }

        return {
          id: playlistId,
          title: response.data.title,
          tracks: response.data.tracks
        };
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error('Playlist not found');
        }
        throw new Error(`Failed to get playlist info: ${error.message}`);
      }
    });
  }
}