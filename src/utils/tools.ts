import { tool, type Tool } from 'ai';
import { z } from 'zod';
import {
  getPopularMovies,
  getPopularShows,
  getTrendingMovies,
  getTrendingShows,
  searchMovieOrShow
} from '~src/services/entertainment/movieService';
import { getNewReleases, getNewReleasesByGenre } from '~src/services/entertainment/musicService';

export const dateTimeTool = tool({
  description: 'Get the current date and time',
  inputSchema: z.object({}),
  execute: () => String(new Date())
});

export const spotifyReleasesTool = tool({
  description: 'Get the latest music releases from Spotify',
  inputSchema: z.object({
    limit: z.number().optional().describe('Number of results to get (default: 10)'),
    genre: z.string().optional().describe('Optional musical genre (e.g.: "pop", "rock", "hip-hop", "jazz", "electro")')
  }),
  execute: async ({ genre, limit = 10 }) => {
    try {
      if (genre) {
        return await getNewReleasesByGenre(genre, limit);
      }
      return await getNewReleases(limit);
    } catch (error) {
      console.warn((error as Error).message);
      return `Error retrieving music outputs`;
    }
  }
});

export const traktReleasesTool = tool({
  description: 'Get the latest movies or shows releases from Trakt.tv',
  inputSchema: z.object({
    type: z
      .enum(['trending-movies', 'trending-shows', 'popular-movies', 'popular-shows'])
      .describe('Type of content to fetch'),
    limit: z.number().optional().describe('Number of results (default: 10, max: 20)'),
    search: z.string().optional().describe('Search for a specific movie or shows by title')
  }),
  execute: async (input) => {
    try {
      const limit = Math.min(input.limit ?? 10, 20);

      if (input.search) {
        console.log('searchMovieOrShow', input.search);
        const searchResult = await searchMovieOrShow(input.search);
        return JSON.stringify(searchResult);
      }

      switch (input.type) {
        case 'trending-movies':
          console.log('trending-movies');
          const trendingMovies = await getTrendingMovies(limit);
          return JSON.stringify(trendingMovies);
        case 'trending-shows':
          console.log('trending-shows');
          const trendingShows = await getTrendingShows(limit);
          return JSON.stringify(trendingShows);
        case 'popular-movies':
          console.log('popular-movies');
          const popularMovies = await getPopularMovies(limit);
          return JSON.stringify(popularMovies);
        case 'popular-shows':
          console.log('popular-shows');
          const popularShows = await getPopularShows(limit);
          return JSON.stringify(popularShows);
        default:
          return 'Unrecognized type';
      }
    } catch (error) {
      console.warn((error as Error).message);
      return 'Error fetching Trakt data...';
    }
  }
});

export const getAgentTools = (agentKey: string): Record<string, Tool> => {
  switch (agentKey) {
    case 'j4rv1s':
      return { dateTimeTool };
    case '3d':
      return { dateTimeTool, spotifyReleasesTool, traktReleasesTool };
    default:
      return {};
  }
};
