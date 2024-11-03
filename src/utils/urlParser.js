/**
 * Parse Yandex Music URL to extract content type and ID
 * Supports various URL formats:
 * - https://music.yandex.ru/album/12345
 * - https://music.yandex.ru/track/12345
 * - https://music.yandex.ru/users/username/playlists/12345
 * - https://music.yandex.ru/artist/12345
 */
export function parseYandexMusicUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

    // Handle different URL patterns
    if (pathParts.length >= 2) {
      // Direct track/album/artist URLs
      if (['album', 'track', 'artist'].includes(pathParts[0])) {
        return {
          type: pathParts[0],
          id: pathParts[1]
        };
      }
      
      // Playlist URLs
      if (pathParts[0] === 'users' && pathParts[2] === 'playlists') {
        return {
          type: 'playlist',
          id: pathParts[3]
        };
      }
    }

    return { type: null, id: null };
  } catch (error) {
    console.error('URL parsing error:', error);
    return { type: null, id: null };
  }
}