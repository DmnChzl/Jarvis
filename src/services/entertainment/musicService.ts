import type { SpotifyReleases, SpotifySearchResult } from '~src/models/spotify';
import { useRedisGetSet } from '~utils/redisClient';

const api = {
  token: () => 'https://accounts.spotify.com/api/token',
  newReleases: (limit: number, offset: number) => {
    return `https://api.spotify.com/v1/browse/new-releases?limit=${limit}&offset=${offset}`;
  },
  search: (_genre: string, type: string, limit: number, market: string) => {
    const genre = encodeURIComponent(_genre);
    return `https://api.spotify.com/v1/search?q=genre:${genre}&type=${type}&limit=${limit}&market=${market}`;
  }
};

type ClientCredentials = { access_token: string; expires_in: number };

const getSpotifyAccessToken = async (): Promise<string> => {
  const redisClient = useRedisGetSet();
  const channel = 'spotify:access_token';

  const cachedToken = await redisClient.get(channel);
  if (cachedToken) return cachedToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify Credentials Required!');
  }

  const response = await fetch(api.token(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  const data = (await response.json()) as ClientCredentials;
  await redisClient.setEx(channel, data.expires_in - 300, data.access_token); // 1 Hour - 5 Minutes
  return data.access_token;
};

export const getNewReleases = async (limit = 10, offset = 0): Promise<SpotifyReleases> => {
  const redisClient = useRedisGetSet();
  const channel = 'spotify:new_releases';

  const cachedReleases = await redisClient.get(channel);
  if (cachedReleases) return JSON.parse(cachedReleases) as SpotifyReleases;

  const token = await getSpotifyAccessToken();

  const response = await fetch(api.newReleases(limit, offset), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Unable to fetch new releases from Spotify');
  }

  const data = (await response.json()) as SpotifyReleases;
  await redisClient.setEx(channel, 10800, JSON.stringify(data)); // 3 Hours
  return data;
};

export const getNewReleasesByGenre = async (genre: string, limit = 10): Promise<SpotifyReleases> => {
  const redisClient = useRedisGetSet();
  const channel = `spotify:new_releases:${genre}`;

  const cachedReleases = await redisClient.get(channel);
  if (cachedReleases) return JSON.parse(cachedReleases) as SpotifyReleases;

  const token = await getSpotifyAccessToken();

  const response = await fetch(api.search(genre, 'album', limit, 'FR'), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Unable to fetch new releases (by genre) from Spotify');
  }

  const data = (await response.json()) as SpotifyReleases;
  await redisClient.setEx(channel, 10800, JSON.stringify(data)); // 3 Hours
  return data;
};

export const searchMusic = async (
  query: string,
  type: 'album' | 'artist' | 'track' | string = 'album,artist,track',
  limit = 10
): Promise<SpotifySearchResult> => {
  const redisClient = useRedisGetSet();
  const channel = `spotify:search:${query}`;

  const cachedSearch = await redisClient.get(channel);
  if (cachedSearch) return JSON.parse(cachedSearch) as SpotifySearchResult;

  const token = await getSpotifyAccessToken();

  const response = await fetch(api.search(query, type, limit, 'FR'), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Unable to searc music on Spotify');
  }

  const data = (await response.json()) as SpotifySearchResult;
  await redisClient.setEx(channel, 10800, JSON.stringify(data)); // 3 Hours
  return data;
};
