import { useRedisGetSet } from '~src/utils/redisClient';

interface TraktMovie {
  title: string;
  year: number;
  ids: {
    trakt: number;
    slug: string;
    imdb: string;
    tmdb: number;
  };
}

interface TraktShow {
  title: string;
  year: number;
  ids: {
    trakt: number;
    slug: string;
    tvdb: number;
    imdb: string;
    tmdb: number;
  };
}

interface Stats {
  like_count: number;
  comment_count: number;
}

interface TraktMovieWithStats extends Stats {
  movie: TraktMovie;
}

interface TraktShowWithStats extends Stats {
  show: TraktShow;
}

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

interface TokenResponseError {
  error: 'pending' | 'slow_dow' | 'expired_token';
  error_description: string;
}

const api = {
  deviceCode: () => 'https://api.trakt.tv/oauth/device/code',
  deviceToken: () => 'https://api.trakt.tv/oauth/device/token',
  trendingMovies: (limit: number) => `https://api.trakt.tv/movies/trending?limit=${limit}&extended=full`,
  trendingShows: (limit: number) => `https://api.trakt.tv/shows/trending?limit=${limit}&extended=full`,
  popularMovies: (limit: number) => `https://api.trakt.tv/movies/popular?limit=${limit}&extended=full`,
  popularShows: (limit: number) => `https://api.trakt.tv/shows/popular?limit=${limit}&extended=full`,
  search: (query: string, type: 'all' | 'movie' | 'show', limit: number) => {
    return `https://api.trakt.tv/search/${type}?query=${encodeURIComponent(query)}&limit=${limit}&extended=full`;
  }
};

const getDeviceCode = async (): Promise<DeviceCodeResponse> => {
  const response = await fetch(api.deviceCode(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      client_id: process.env.TRAKT_CLIENT_ID ?? ''
    }
  });

  if (!response.ok) {
    throw new Error('Trakt API Error');
  }

  const data = (await response.json()) as DeviceCodeResponse;
  return data;
};

const pollAccessToken = async (deviceCode: string, interval: number): Promise<TokenResponse> => {
  const clientId = process.env.TRAKT_CLIENT_ID ?? '';
  const clientSecret = process.env.TRAKT_CLIENT_SECRET ?? '';

  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      const response = await fetch(api.deviceToken(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: deviceCode,
          client_id: clientId,
          client_secret: clientSecret
        })
      });

      if (response.ok) {
        const data = (await response.json()) as TokenResponse;
        clearInterval(timer);
        return resolve(data);
      }

      const isBadRequest = response.status === 400;
      const data = (await response.json()) as TokenResponseError;

      if (isBadRequest && data.error === 'pending') {
        console.log('Wait For It...');
        return;
      }

      if (isBadRequest && data.error === 'slow_dow') {
        console.warn('Too Fast! Slow Down!');
        return;
      }

      if (isBadRequest && data.error === 'expired_token') {
        clearInterval(timer);
        return reject(new Error('Device Code Has Expired'));
      }

      clearInterval(timer);
      return reject(new Error('Authentication Error'));
    }, interval * 1000);
  });
};

export const getAccessToken = async () => {
  const redisClient = useRedisGetSet();
  const channel = 'spotify:access_token';

  const cachedToken = await redisClient.get(channel);
  if (cachedToken) return cachedToken;

  const { device_code: deviceCode, interval } = await getDeviceCode();
  const { access_token: accessToken, expires_in: expiresIn } = await pollAccessToken(deviceCode, interval);

  await redisClient.setEx(channel, expiresIn - 300, accessToken);
  return accessToken;
};

export const getTrendingMovies = async (limit = 10): Promise<TraktMovieWithStats[]> => {
  const redisClient = useRedisGetSet();
  const channel = 'trakt:trending_movies';

  const cachedMovies = await redisClient.get(channel);
  if (cachedMovies) return JSON.parse(cachedMovies) as TraktMovieWithStats[];

  const response = await fetch(api.trendingMovies(limit), {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-key': process.env.TRAKT_CLIENT_ID ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Trakt API Error');
  }

  const data = (await response.json()) as TraktMovieWithStats[];
  // await redisClient.setEx(channel, 21600, JSON.stringify(data));
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
      'trakt-api-key': process.env.TRAKT_CLIENT_ID ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Trakt API Error');
  }

  const data = (await response.json()) as TraktShowWithStats[];
  // await redisClient.setEx(channel, 21600, JSON.stringify(data));
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
      'trakt-api-key': process.env.TRAKT_CLIENT_ID ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Trakt API Error');
  }

  const data = (await response.json()) as TraktMovie[];
  // await redisClient.setEx(channel, 21600, JSON.stringify(data));
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
      'trakt-api-key': process.env.TRAKT_CLIENT_ID ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    throw new Error('Trakt API Error');
  }

  const data = (await response.json()) as TraktShow[];
  // await redisClient.setEx(channel, 21600, JSON.stringify(data));
  return data;
};

export const searchMovieOrShow = async (
  query: string,
  type: 'all' | 'movie' | 'show' = 'all'
): Promise<Array<{ movie?: TraktMovie; show?: TraktShow }>> => {
  const response = await fetch(api.search(query, type, 10), {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-key': process.env.TRAKT_CLIENT_ID ?? '',
      'trakt-api-version': '2'
    }
  });

  if (!response.ok) {
    console.log('response', response);
    throw new Error('Trakt API Error');
  }

  const data = (await response.json()) as Array<{ movie?: TraktMovie; show?: TraktShow }>;
  return data;
};
