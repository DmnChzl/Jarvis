import { z } from 'zod';

export const traktIdsSchema = z.object({
  trakt: z.number(),
  slug: z.string(),
  imdb: z.string(),
  tmdb: z.number()
});

export const traktMediaSchema = z.object({
  title: z.string(),
  year: z.number(),
  ids: traktIdsSchema
});

export const traktMovieSchema = traktMediaSchema;

export const traktShowSchema = traktMediaSchema.extend({
  ids: traktIdsSchema.extend({
    tvdb: z.number()
  })
});

export const traktStatsSchema = z.object({
  like_count: z.number(),
  comment_count: z.number()
});

export const traktMovieWithStatsSchema = traktStatsSchema.extend({
  movie: traktMovieSchema
});

export const traktShowWithStatsSchema = traktStatsSchema.extend({
  show: traktShowSchema
});

export const traktSearchResultSchema = z.object({
  movie: traktMovieSchema.optional(),
  show: traktShowSchema.optional()
});

export type TraktMovie = z.infer<typeof traktMovieSchema>;
export type TraktShow = z.infer<typeof traktShowSchema>;
export type TraktMovieWithStats = z.infer<typeof traktMovieWithStatsSchema>;
export type TraktShowWithStats = z.infer<typeof traktShowWithStatsSchema>;
export type TraktSearchResult = z.infer<typeof traktSearchResultSchema>;
