import { tool, type Tool } from 'ai';
import { z } from 'zod';
import {
  getPopularMovies,
  getPopularShows,
  getTrendingMovies,
  getTrendingShows,
  searchMovieOrShow
} from '~src/services/entertainment/movieService';
import { getNewReleases, getNewReleasesByGenre, searchMusic } from '~src/services/entertainment/musicService';

export const dateTimeTool = tool({
  description: 'Get the current date and time',
  inputSchema: z.object({}),
  execute: () => String(new Date())
});

export const spotifyReleasesTool = tool({
  description: 'Get the latest music releases from Spotify',
  inputSchema: z.object({
    genre: z.string().optional().describe('Optional musical genre (e.g.: "pop", "rock", "hip-hop", "jazz", "electro")'),
    limit: z.number().optional().describe('Number of results (default: 10)')
  }),
  execute: async ({ genre, limit = 10 }) => {
    try {
      if (genre) {
        const releases = await getNewReleasesByGenre(genre, limit);
        return JSON.stringify(releases);
      }

      const releases = await getNewReleases(limit);
      return JSON.stringify(releases);
    } catch (error) {
      console.warn((error as Error).message);
      return 'Unable to fetch music releases from Spotify';
    }
  }
});

export const spotifySearchTool = tool({
  description: 'Search for music (album, artist, track, etc.) on Spotify by query',
  inputSchema: z.object({
    query: z.string().describe('The search query (e.g., "Daft Punk", "Bohemian Rhapsody", "Man On The Moon")'),
    type: z
      .string()
      .optional()
      .describe(
        'The type of content to search for; Can be "album", "artist", "track", or a comma-separated list (default: "album,artist,track")'
      ),
    limit: z.number().optional().describe('Number of results (default: 10)')
  }),
  execute: async ({ query, type, limit = 10 }) => {
    try {
      const result = await searchMusic(query, type, limit);
      return JSON.stringify(result);
    } catch (error) {
      console.warn((error as Error).message);
      return 'Unable to search music on Spotify';
    }
  }
});

export const traktReleasesTool = tool({
  description: 'Get trending or popular movies and shows from Trakt',
  inputSchema: z.object({
    type: z
      .enum(['trending-movies', 'trending-shows', 'popular-movies', 'popular-shows'])
      .describe('The type of content to fetch'),
    limit: z.number().optional().describe('Number of results (default: 10, max: 20)')
  }),
  execute: async (input) => {
    try {
      const limit = Math.min(input.limit ?? 10, 20);

      switch (input.type) {
        case 'trending-movies':
          const trendingMovies = await getTrendingMovies(limit);
          return JSON.stringify(trendingMovies);

        case 'trending-shows':
          const trendingShows = await getTrendingShows(limit);
          return JSON.stringify(trendingShows);

        case 'popular-movies':
          const popularMovies = await getPopularMovies(limit);
          return JSON.stringify(popularMovies);

        case 'popular-shows':
          const popularShows = await getPopularShows(limit);
          return JSON.stringify(popularShows);

        default:
          return 'Unknown type of content...';
      }
    } catch (error) {
      console.warn((error as Error).message);
      return 'Unable to fetch movies or shows from Trakt';
    }
  }
});

export const traktSearchTool = tool({
  description: 'Search for movies and shows on Trakt by query',
  inputSchema: z.object({
    query: z.string().describe('The search query (e.g., "Inception", "Breaking Bad", "Iron Man")'),
    type: z.enum(['all', 'movie', 'show']).optional().describe('The type of content to search for (default: "all")')
  }),
  execute: async ({ query, type = 'all' }) => {
    try {
      const result = await searchMovieOrShow(query, type);
      return JSON.stringify(result);
    } catch (error) {
      console.warn((error as Error).message);
      return 'Unable to search movies or shows on Trakt';
    }
  }
});

export const getAgentTools = (agentKey: string): Record<string, Tool> => {
  switch (agentKey) {
    case 'j4rv1s':
      return { dateTimeTool };
    case '3d':
      return { dateTimeTool, spotifyReleasesTool, spotifySearchTool, traktReleasesTool, traktSearchTool };
    case 'm0k4':
      return {};
    default:
      return {};
  }
};
