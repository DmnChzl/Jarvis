interface ArtistItem {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

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

interface TrackItem {
  id: string;
  name: string;
  artists: {
    name: string;
  }[];
  album: {
    name: string;
    images: {
      url: string;
    }[];
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyReleases {
  albums: {
    items: AlbumItem[];
  };
}

export interface SpotifySearchResult {
  albums?: { items: AlbumItem[] };
  artists?: { items: ArtistItem[] };
  tracks?: { items: TrackItem[] };
}
