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
import { hexToRgb, hslGuard, hslToRgb, rgbGuard, rgbToHex, rgbToHsl } from './colors';

export const dateTimeTool = tool({
  description: 'Get the current date and time',
  inputSchema: z.object({}),
  execute: () => String(new Date())
});

export const colorConversionTool = tool({
  description: 'Convert colors between different formats (hex, rgb, hsl)',
  inputSchema: z.object({
    color: z.string().describe('The color to convert (e.g., "#4285F4", "rgb(66, 133, 244)", "hsl(217, 89, 61)")'),
    targetFormat: z.enum(['hex', 'rgb', 'hsl']).describe('The target format to convert to')
  }),
  execute: async ({ color, targetFormat }) => {
    try {
      color = color.trim();
      let result = '';

      if (targetFormat === 'hex') {
        if (color.startsWith('rgb')) {
          result = rgbToHex(color);
        } else if (color.startsWith('hsl')) {
          result = hslToRgb(color);
          result = rgbToHex(result);
        } else {
          result = color;
        }
      } else if (targetFormat === 'rgb') {
        if (color.startsWith('#')) {
          result = hexToRgb(color);
        } else if (color.startsWith('hsl')) {
          result = hslToRgb(color);
        } else {
          result = color;
        }
      } else if (targetFormat === 'hsl') {
        if (color.startsWith('rgb')) {
          result = rgbToHsl(color);
        } else if (color.startsWith('#')) {
          const rgb = hexToRgb(color);
          result = rgbToHsl(rgb);
        } else {
          result = color;
        }
      }

      return JSON.stringify({
        input: color,
        output: result,
        format: targetFormat
      });
    } catch (error) {
      console.warn((error as Error).message);
      return 'Unable to convert color';
    }
  }
});

export const complementaryColorTool = tool({
  description: 'Find the complementary color (opposite on the color wheel)',
  inputSchema: z.object({
    color: z.string().describe('The color in hex format (e.g., "#4285F4")'),
    outputFormat: z.enum(['hex', 'rgb', 'hsl']).optional().describe('The output format (default: "hex")')
  }),
  execute: async ({ color, outputFormat = 'hex' }) => {
    try {
      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb);

      const [hue, sat, lum] = hslGuard(hsl);
      const complementaryHsl = `hsl(${(hue + 180) % 360},${sat}%,${lum}%)`;

      let result = complementaryHsl;
      if (outputFormat === 'hex') {
        const compRgb = hslToRgb(complementaryHsl);
        result = rgbToHex(compRgb);
      } else if (outputFormat === 'rgb') {
        result = hslToRgb(complementaryHsl);
      }

      return JSON.stringify({
        originalColor: color,
        complementaryColor: result,
        format: outputFormat
      });
    } catch (error) {
      console.warn((error as Error).message);
      return 'Unable to calculate the complementary color';
    }
  }
});

export const colorHarmonyTool = tool({
  description: 'Generate color harmonies (triadic, analogous, split-complementary)',
  inputSchema: z.object({
    color: z.string().describe('The base color in hex format (e.g., "#4285F4")'),
    harmonyType: z
      .enum(['triadic', 'analogous', 'split-complementary', 'tetradic'])
      .describe('The type of color harmony to generate')
  }),
  execute: async ({ color, harmonyType }) => {
    try {
      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb);
      const [hue, sat, lum] = hslGuard(hsl);

      const colors: string[] = [color];
      let offsets: number[] = [];

      switch (harmonyType) {
        case 'triadic':
          offsets = [120, 240];
          break;
        case 'analogous':
          offsets = [30, -30];
          break;
        case 'split-complementary':
          offsets = [150, 210];
          break;
        case 'tetradic':
          offsets = [90, 180, 270];
          break;
      }

      for (const offset of offsets) {
        const newHue = (hue + offset + 360) % 360;
        const harmonyHsl = `hsl(${newHue},${sat}%,${lum}%)`;
        const harmonyRgb = hslToRgb(harmonyHsl);
        colors.push(rgbToHex(harmonyRgb));
      }

      return JSON.stringify({
        baseColor: color,
        harmonyType,
        palette: colors
      });
    } catch (error) {
      console.warn((error as Error).message);
      return 'Unable to generate color harmony';
    }
  }
});

export const colorAnalysisTool = tool({
  description: 'Analyze a color and get detailed information (rgb, hex, hsl, brightness, etc.)',
  inputSchema: z.object({
    color: z.string().describe('The color to analyze in HEX format (e.g., "#4285F4")')
  }),
  execute: async ({ color }) => {
    try {
      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb);
      const [r, g, b] = rgbGuard(rgb);

      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      return JSON.stringify({
        hex: color,
        rgb,
        hsl,
        brightness: Math.round(brightness),
        isDark: brightness < 128,
        luminance: Math.round((brightness / 255) * 100)
      });
    } catch (error) {
      console.warn((error as Error).message);
      return 'Unable to analyze the color';
    }
  }
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
      return { dateTimeTool }; // colorConversionTool, complementaryColorTool, colorHarmonyTool, colorAnalysisTool
    case '3d':
      return { spotifyReleasesTool, spotifySearchTool, traktReleasesTool, traktSearchTool };
    case 'm0k4':
      return { dateTimeTool };
    default:
      return {};
  }
};
