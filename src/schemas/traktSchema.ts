import { z } from 'zod';

export const traktIdsSchema = z.object({
  trakt: z.number(),
  slug: z.string(),
  imdb: z.string().nullable(),
  tmdb: z.number().nullable()
});

export const traktMediaSchema = z.object({
  title: z.string(),
  year: z.number(),
  ids: traktIdsSchema,
  overview: z.string()
});

export const traktMovieSchema = traktMediaSchema.extend({
  released: z.string()
});

export const traktShowSchema = traktMediaSchema.extend({
  ids: traktIdsSchema.extend({
    tvdb: z.number().nullable()
  }),
  first_aired: z.string()
});

export const traktTrendingMovieSchema = z.object({
  movie: traktMovieSchema
});

export const traktTrendingShowSchema = z.object({
  show: traktShowSchema
});

export const traktSearchResultSchema = z.object({
  type: z.enum(['movie', 'show']),
  movie: traktMovieSchema.optional(),
  show: traktShowSchema.optional()
});

export type TraktMovie = z.infer<typeof traktMovieSchema>;
export type TraktShow = z.infer<typeof traktShowSchema>;
export type TraktTrendingMovie = z.infer<typeof traktTrendingMovieSchema>;
export type TraktTrendingShow = z.infer<typeof traktTrendingShowSchema>;
export type TraktSearchResult = z.infer<typeof traktSearchResultSchema>;
