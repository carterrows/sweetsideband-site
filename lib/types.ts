export type StreamingLink = string | { status: "coming-soon" };

export type Band = {
  name: string;
  location: string;
  email: string;
  social: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    facebook?: string;
  };
  streaming: {
    spotify: StreamingLink;
    appleMusic: StreamingLink;
  };
};

export type Show = {
  id: string;
  date: string;
  city: string;
  venue: string;
  venueUrl?: string;
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
};
