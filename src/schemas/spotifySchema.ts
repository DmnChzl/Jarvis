import { z } from 'zod';

export const clientCredentialsSchema = z.object({
  access_token: z.string(),
  expires_in: z.number()
});

export const albumItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(
    z.object({
      name: z.string()
    })
  ),
  release_date: z.string(),
  images: z.array(
    z.object({
      url: z.string()
    })
  ),
  external_urls: z.object({
    spotify: z.string()
  })
});

export const artistItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  external_urls: z.object({
    spotify: z.string()
  })
});

export const traktItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(
    z.object({
      name: z.string()
    })
  ),
  album: z.object({
    name: z.string(),
    images: z.array(
      z.object({
        url: z.string()
      })
    )
  }),
  duration_ms: z.number(),
  external_urls: z.object({
    spotify: z.string()
  })
});

export const spotifyReleasesSchema = z.object({
  albums: z.object({
    items: z.array(albumItemSchema)
  })
});

export const spotifySearchResultSchema = z.object({
  albums: z
    .object({
      items: z.array(albumItemSchema)
    })
    .optional(),
  artists: z
    .object({
      items: z.array(artistItemSchema)
    })
    .optional(),
  tracks: z
    .object({
      items: z.array(traktItemSchema)
    })
    .optional()
});

export type ClientCredentials = z.infer<typeof clientCredentialsSchema>;
export type AlbumItem = z.infer<typeof albumItemSchema>;
export type ArtistItem = z.infer<typeof artistItemSchema>;
export type TrackItem = z.infer<typeof traktItemSchema>;
export type SpotifyReleases = z.infer<typeof spotifyReleasesSchema>;
export type SpotifySearchResult = z.infer<typeof spotifySearchResultSchema>;
