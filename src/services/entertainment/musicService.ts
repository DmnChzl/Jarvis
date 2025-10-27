import { useRedisGetSet } from '~utils/redisClient';

const api = {
  token: () => 'https://accounts.spotify.com/api/token',
  newReleases: (limit: number, offset: number) => {
    return `https://api.spotify.com/v1/browse/new-releases?limit=${limit}&offset=${offset}`;
  },
  search: (genre: string, limit: number, market: string) => {
    return `https://api.spotify.com/v1/search?q=genre:${encodeURIComponent(
      genre
    )}&type=album&limit=${limit}&market=${market}`;
  }
};

type ClientCredentials = { access_token: string; expires_in: number };

const getSpotifyAccessToken = async (): Promise<string> => {
  const redisClient = useRedisGetSet();
  const channel = 'spotify:access_token';

  const cachedToken = await redisClient.get(channel);
  if (cachedToken) return cachedToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID ?? '';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? '';

  const response = await fetch(api.token(), {
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

  const data = (await response.json()) as ClientCredentials;
  await redisClient.setEx(channel, data.expires_in - 300, data.access_token);
  return data.access_token;
};

interface AlbumItem {
  id: string;
  name: string;
  artists: {
    name: string;
  }[];
  release_date: string;
  images: {
    url: string;
  }[];
  external_urls: {
    spotify: string;
  };
}

const mapAlbumItemToRelease = (album: AlbumItem) => {
  const artist = album.artists.map((artist) => artist.name).join(', ');
  const releaseDate = album.release_date;
  const spotifyUrl = album.external_urls.spotify;
  // const [coverImage] = album.images;

  return (
    `🎵 **${album.name}** par ${artist}\n` +
    `📅 Sortie: ${new Date(releaseDate).toLocaleDateString('fr-FR')}\n` +
    `🔗 [Écouter sur Spotify](${spotifyUrl})`
  );
};

export const getNewReleases = async (limit = 10, offset = 0): Promise<string> => {
  const token = await getSpotifyAccessToken();

  const response = await fetch(api.newReleases(limit, offset), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Spotify API Error');
  }

  const data = (await response.json()) as { albums: { items: AlbumItem[] } };
  return JSON.stringify(data);

  // const releases = data.albums.items.map(mapAlbumItemToRelease);
  // return `Voici les ${data.albums.items.length} dernières sorties musicales:\n\n${releases}`;
};

export const getNewReleasesByGenre = async (genre: string, limit = 10): Promise<string> => {
  const token = await getSpotifyAccessToken();

  const response = await fetch(api.search(genre, limit, 'FR'), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Spotify API Error');
  }

  const data = (await response.json()) as { albums: { items: AlbumItem[] } };
  return JSON.stringify(data);

  // if (data.albums.items.length === 0) {
  //   return `Aucune sortie musicale trouvée pour le genre "${genre}".`;
  // }

  // const releases = data.albums.items.map(mapAlbumItemToRelease);
  // return `Sorties récentes en ${genre}:\n\n${releases}`;
};
