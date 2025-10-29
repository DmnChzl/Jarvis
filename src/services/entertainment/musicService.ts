import {
  clientCredentialsSchema,
  spotifyReleasesSchema,
  spotifySearchResultSchema,
  type SpotifyReleases,
  type SpotifySearchResult
} from '~src/schemas/spotifySchema';
import { useRedisClient } from '~utils/redisClient';
import { refetch } from '~utils/refetch';

const spotifyApi = {
  token: () => 'https://accounts.spotify.com/api/token',
  newReleases: (limit: number, offset: number) => {
    return `https://api.spotify.com/v1/browse/new-releases?limit=${limit}&offset=${offset}`;
  },
  search: (_query: string, type: string, limit: number, market: string) => {
    const query = encodeURIComponent(_query);
    return `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}&market=${market}`;
  }
};

const getSpotifyAccessToken = async (): Promise<string> => {
  const redisClient = useRedisClient();
  const channel = 'spotify:access_token';

  const cachedToken = await redisClient.get(channel);
  if (cachedToken) return cachedToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Spotify Credentials Required!');
  }

  const data = await refetch(spotifyApi.token(), clientCredentialsSchema, {
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

  await redisClient.setEx(channel, data.expires_in - 300, data.access_token); // 1 Hour - 5 Minutes
  return data.access_token;
};

export const getNewReleases = async (limit = 10, offset = 0): Promise<SpotifyReleases> => {
  const redisClient = useRedisClient();
  const channel = 'spotify:new_releases';

  const cachedReleases = await redisClient.get(channel);
  if (cachedReleases) {
    const data = JSON.parse(cachedReleases);
    return spotifyReleasesSchema.parse(data);
  }

  const token = await getSpotifyAccessToken();

  try {
    const data = await refetch(spotifyApi.newReleases(limit, offset), spotifyReleasesSchema, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    await redisClient.setEx(channel, 10800, JSON.stringify(data)); // 3 Hours
    return data;
  } catch {
    throw new Error('Unable to fetch new releases from Spotify');
  }
};

export const getNewReleasesByGenre = async (genre: string, limit = 10): Promise<SpotifyReleases> => {
  const redisClient = useRedisClient();
  const channel = `spotify:new_releases:${genre}`;

  const cachedReleases = await redisClient.get(channel);
  if (cachedReleases) {
    const data = JSON.parse(cachedReleases);
    return spotifyReleasesSchema.parse(data);
  }

  const token = await getSpotifyAccessToken();

  try {
    const data = await refetch(spotifyApi.search(genre, 'album', limit, 'FR'), spotifyReleasesSchema, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    await redisClient.setEx(channel, 10800, JSON.stringify(data)); // 3 Hours
    return data;
  } catch {
    throw new Error('Unable to fetch new releases (by genre) from Spotify');
  }
};

export const searchMusic = async (
  query: string,
  type: 'album' | 'artist' | 'track' | string = 'album,artist,track',
  limit = 10
): Promise<SpotifySearchResult> => {
  const redisClient = useRedisClient();
  const channel = `spotify:search:${query}:${type}`;

  const cachedSearch = await redisClient.get(channel);
  if (cachedSearch) {
    const data = JSON.parse(cachedSearch);
    return spotifySearchResultSchema.parse(data);
  }

  const token = await getSpotifyAccessToken();

  try {
    const data = await refetch(spotifyApi.search(query, type, limit, 'FR'), spotifySearchResultSchema, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    await redisClient.setEx(channel, 10800, JSON.stringify(data)); // 3 Hours
    return data;
  } catch {
    throw new Error('Unable to search music on Spotify');
  }
};
