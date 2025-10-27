import type { TraktMovie, TraktMovieWithStats, TraktShow, TraktShowWithStats } from '~src/models/trakt';
import { useRedisGetSet } from '~src/utils/redisClient';

const api = {
  trendingMovies: (limit: number) => `https://api.trakt.tv/movies/trending?limit=${limit}&extended=full`,
  trendingShows: (limit: number) => `https://api.trakt.tv/shows/trending?limit=${limit}&extended=full`,
  popularMovies: (limit: number) => `https://api.trakt.tv/movies/popular?limit=${limit}&extended=full`,
  popularShows: (limit: number) => `https://api.trakt.tv/shows/popular?limit=${limit}&extended=full`,
  search: (query: string, type: 'all' | 'movie' | 'show', limit: number) => {
    return `https://api.trakt.tv/search/${type}?query=${encodeURIComponent(query)}&limit=${limit}&extended=full`;
  }
};

export const getTrendingMovies = async (limit = 10): Promise<TraktMovieWithStats[]> => {
  const redisClient = useRedisGetSet();
  const channel = 'trakt:trending_movies';

  const cachedMovies = await redisClient.get(channel);
  if (cachedMovies) return JSON.parse(cachedMovies) as TraktMovieWithStats[];

  const response = await fetch(api.trendingMovies(limit), {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-key': process.env.TRAKT_API_KEY ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to fetch trending movies from Trakt');
  }

  const data = (await response.json()) as TraktMovieWithStats[];
  await redisClient.setEx(channel, 21600, JSON.stringify(data)); // 6 Hours
  return data;
};

export const getTrendingShows = async (limit = 10): Promise<TraktShowWithStats[]> => {
  const redisClient = useRedisGetSet();
  const channel = 'trakt:trending_shows';

  const cachedShows = await redisClient.get(channel);
  if (cachedShows) return JSON.parse(cachedShows) as TraktShowWithStats[];

  const response = await fetch(api.trendingShows(limit), {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-key': process.env.TRAKT_API_KEY ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to fetch trending shows from Trakt');
  }

  const data = (await response.json()) as TraktShowWithStats[];
  await redisClient.setEx(channel, 21600, JSON.stringify(data)); // 6 Hours
  return data;
};

export const getPopularMovies = async (limit = 10): Promise<TraktMovie[]> => {
  const redisClient = useRedisGetSet();
  const channel = 'trakt:popular_movies';

  const cachedMovies = await redisClient.get(channel);
  if (cachedMovies) return JSON.parse(cachedMovies) as TraktMovie[];

  const response = await fetch(api.popularMovies(limit), {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-key': process.env.TRAKT_API_KEY ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to fetch popular movies from Trakt');
  }

  const data = (await response.json()) as TraktMovie[];
  await redisClient.setEx(channel, 21600, JSON.stringify(data)); // 6 Hours
  return data;
};

export const getPopularShows = async (limit = 10): Promise<TraktShow[]> => {
  const redisClient = useRedisGetSet();
  const channel = 'trakt:popular_shows';

  const cachedShows = await redisClient.get(channel);
  if (cachedShows) return JSON.parse(cachedShows) as TraktShow[];

  const response = await fetch(api.popularShows(limit), {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-key': process.env.TRAKT_API_KEY ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to fetch popular shows from Trakt');
  }

  const data = (await response.json()) as TraktShow[];
  await redisClient.setEx(channel, 21600, JSON.stringify(data)); // 6 Hours
  return data;
};

export const searchMedia = async (
  query: string,
  type: 'all' | 'movie' | 'show' = 'all'
): Promise<Array<{ movie?: TraktMovie; show?: TraktShow }>> => {
  const response = await fetch(api.search(query, type, 10), {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-key': process.env.TRAKT_API_KEY ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Trakt API Error');
  }

  const data = (await response.json()) as Array<{ movie?: TraktMovie; show?: TraktShow }>;
  return data;
};
