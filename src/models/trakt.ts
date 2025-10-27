interface TraktMedia {
  title: string;
  year: number;
  ids: {
    trakt: number;
    slug: string;
    imdb: string;
    tmdb: number;
  };
}

export interface TraktMovie extends TraktMedia {}

export interface TraktShow extends TraktMedia {
  ids: {
    trakt: number;
    slug: string;
    tvdb: number;
    imdb: string;
    tmdb: number;
  };
}

interface TraktStats {
  like_count: number;
  comment_count: number;
}

export interface TraktMovieWithStats extends TraktStats {
  movie: TraktMovie;
}

export interface TraktShowWithStats extends TraktStats {
  show: TraktShow;
}
