import { YandexMusicService } from '../services/yandexMusic.js';
import { Downloader } from '../services/downloader.js';

export class MessageHandler {
  constructor(bot) {
    this.bot = bot;
    this.yandexMusic = new YandexMusicService();
    this.downloader = new Downloader();
  }

  async handleTrack(chatId, trackId) {
    try {
      await this.bot.sendMessage(chatId, 'Getting track info...');
      
      const trackInfo = await this.yandexMusic.getTrackInfo(trackId);
      await this.bot.sendMessage(chatId, `Found track: ${trackInfo.title}`);

      await this.bot.sendMessage(chatId, 'Getting download URL...');
      const downloadUrl = await this.yandexMusic.getDownloadUrl(trackId);

      const fileName = `${trackInfo.artists[0].name} - ${trackInfo.title}.mp3`
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, ' ');

      await this.bot.sendMessage(chatId, 'Downloading track...');
      const filePath = await this.downloader.downloadTrack(downloadUrl, fileName);
      
      await this.bot.sendMessage(chatId, 'Sending track...');
      await this.bot.sendAudio(chatId, filePath);
      
      this.downloader.cleanup(filePath);
      await this.bot.sendMessage(chatId, 'Done!');
    } catch (error) {
      const errorMessage = error.response?.status === 404 
        ? 'Track not found. Please check if the link is correct.'
        : `Failed to handle track: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  async handleArtist(chatId, artistId) {
    try {
      const artist = await this.yandexMusic.getArtistInfo(artistId);
      await this.bot.sendMessage(chatId, `Processing artist's popular tracks...`);

      let successCount = 0;
      let failCount = 0;

      // Download top 10 tracks
      const topTracks = artist.tracks.slice(0, 10);
      for (const track of topTracks) {
        try {
          await this.handleTrack(chatId, track.id);
          successCount++;
        } catch (error) {
          failCount++;
          await this.bot.sendMessage(
            chatId,
            `Failed to process track ${track.title}: ${error.message}`
          );
        }
      }

      const summary = `Artist's top tracks download completed!\nSuccessful: ${successCount}\nFailed: ${failCount}`;
      await this.bot.sendMessage(chatId, summary);
    } catch (error) {
      const errorMessage = error.response?.status === 404 
        ? 'Artist not found. Please check if the link is correct.'
        : `Failed to handle artist: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  async handleAlbum(chatId, albumId) {
    try {
      const album = await this.yandexMusic.getAlbumInfo(albumId);
      await this.bot.sendMessage(chatId, `Processing album: ${album.title}`);

      let successCount = 0;
      let failCount = 0;

      for (const volume of album.volumes) {
        for (const track of volume) {
          try {
            await this.handleTrack(chatId, track.id);
            successCount++;
          } catch (error) {
            failCount++;
            await this.bot.sendMessage(
              chatId,
              `Failed to process track ${track.title}: ${error.message}`
            );
          }
        }
      }

      const summary = `Album download completed!\nSuccessful: ${successCount}\nFailed: ${failCount}`;
      await this.bot.sendMessage(chatId, summary);
    } catch (error) {
      const errorMessage = error.response?.status === 404 
        ? 'Album not found. Please check if the link is correct.'
        : `Failed to handle album: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  async handlePlaylist(chatId, playlistId) {
    try {
      const playlist = await this.yandexMusic.getPlaylistInfo(playlistId);
      await this.bot.sendMessage(chatId, `Processing playlist: ${playlist.title}`);

      let successCount = 0;
      let failCount = 0;

      for (const track of playlist.tracks) {
        try {
          await this.handleTrack(chatId, track.id);
          successCount++;
        } catch (error) {
          failCount++;
          await this.bot.sendMessage(
            chatId,
            `Failed to process track ${track.title}: ${error.message}`
          );
        }
      }

      const summary = `Playlist download completed!\nSuccessful: ${successCount}\nFailed: ${failCount}`;
      await this.bot.sendMessage(chatId, summary);
    } catch (error) {
      const errorMessage = error.response?.status === 404 
        ? 'Playlist not found. Please check if the link is correct.'
        : `Failed to handle playlist: ${error.message}`;
      throw new Error(errorMessage);
    }
  }
}