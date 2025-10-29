import { z } from 'zod';
import {
  traktMovieSchema,
  traktSearchResultSchema,
  traktShowSchema,
  traktTrendingMovieSchema,
  traktTrendingShowSchema,
  type TraktMovie,
  type TraktSearchResult,
  type TraktShow,
  type TraktTrendingMovie,
  type TraktTrendingShow
} from '~src/schemas/traktSchema';
import { useRedisClient } from '~utils/redisClient';
import { refetch } from '~utils/refetch';

const traktApi = {
  trendingMovies: (limit: number) => `https://api.trakt.tv/movies/trending?limit=${limit}&extended=full`,
  trendingShows: (limit: number) => `https://api.trakt.tv/shows/trending?limit=${limit}&extended=full`,
  popularMovies: (limit: number) => `https://api.trakt.tv/movies/popular?limit=${limit}&extended=full`,
  popularShows: (limit: number) => `https://api.trakt.tv/shows/popular?limit=${limit}&extended=full`,
  search: (_query: string, type: 'all' | 'movie' | 'show', limit: number) => {
    const query = encodeURIComponent(_query);
    return `https://api.trakt.tv/search/${type}?query=${query}&limit=${limit}&extended=full`;
  }
};

const getTraktHeaders = () => {
  const apiKey = process.env.TRAKT_API_KEY;
  if (!apiKey) throw new Error('Trakt API Key Required!');

  return {
    'Content-Type': 'application/json',
    'trakt-api-key': apiKey,
    'trakt-api-version': '2'
  };
};

export const getTrendingMovies = async (limit = 10): Promise<TraktTrendingMovie[]> => {
  const redisClient = useRedisClient();
  const channel = 'trakt:trending_movies';

  const cachedMovies = await redisClient.get(channel);
  if (cachedMovies) {
    const data = JSON.parse(cachedMovies);
    return z.array(traktTrendingMovieSchema).parse(data);
  }

  try {
    const data = await refetch(traktApi.trendingMovies(limit), z.array(traktTrendingMovieSchema), {
      headers: getTraktHeaders()
    });

    await redisClient.setEx(channel, 21600, JSON.stringify(data)); // 6 Hours
    return data;
  } catch {
    throw new Error('Unable to fetch trending movies from Trakt');
  }
};

export const getTrendingShows = async (limit = 10): Promise<TraktTrendingShow[]> => {
  const redisClient = useRedisClient();
  const channel = 'trakt:trending_shows';

  const cachedShows = await redisClient.get(channel);
  if (cachedShows) {
    const data = JSON.parse(cachedShows);
    return z.array(traktTrendingShowSchema).parse(data);
  }

  try {
    const data = await refetch(traktApi.trendingShows(limit), z.array(traktTrendingShowSchema), {
      headers: getTraktHeaders()
    });

    await redisClient.setEx(channel, 21600, JSON.stringify(data)); // 6 Hours
    return data;
  } catch {
    throw new Error('Unable to fetch trending shows from Trakt');
  }
};

export const getPopularMovies = async (limit = 10): Promise<TraktMovie[]> => {
  const redisClient = useRedisClient();
  const channel = 'trakt:popular_movies';

  const cachedMovies = await redisClient.get(channel);
  if (cachedMovies) {
    const data = JSON.parse(cachedMovies);
    return z.array(traktMovieSchema).parse(data);
  }

  try {
    const data = await refetch(traktApi.popularMovies(limit), z.array(traktMovieSchema), {
      headers: getTraktHeaders()
    });

    await redisClient.setEx(channel, 21600, JSON.stringify(data)); // 6 Hours
    return data;
  } catch {
    throw new Error('Unable to fetch popular movies from Trakt');
  }
};

export const getPopularShows = async (limit = 10): Promise<TraktShow[]> => {
  const redisClient = useRedisClient();
  const channel = 'trakt:popular_shows';

  const cachedShows = await redisClient.get(channel);
  if (cachedShows) {
    const data = JSON.parse(cachedShows);
    return z.array(traktShowSchema).parse(data);
  }

  try {
    const data = await refetch(traktApi.popularShows(limit), z.array(traktShowSchema), {
      headers: getTraktHeaders()
    });

    await redisClient.setEx(channel, 21600, JSON.stringify(data)); // 6 Hours
    return data;
  } catch {
    throw new Error('Unable to fetch popular shows from Trakt');
  }
};

export const searchMovieOrShow = async (
  query: string,
  type: 'all' | 'movie' | 'show' = 'all'
): Promise<TraktSearchResult[]> => {
  try {
    return await refetch(traktApi.search(query, type, 10), z.array(traktSearchResultSchema), {
      headers: getTraktHeaders()
    });
  } catch {
    throw new Error('Unable to search movie or show on Trakt');
  }
};
