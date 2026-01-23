export type Band = {
  name: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  social: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    bandcamp?: string;
  };
  streaming: {
    spotify: string;
    appleMusic: string;
  };
};

export type Show = {
  id: string;
  date: string;
  city: string;
  venue: string;
  ticketUrl?: string;
  notes?: string;
};

export type ShowsData = {
  upcoming: Show[];
  past: Show[];
};

export type Member = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
};

export type MediaItem = {
  id: string;
  type: "image" | "video";
  title: string;
  src?: string;
  thumbnail?: string;
  link: string;
  alt?: string;
  showId?: string;
};
