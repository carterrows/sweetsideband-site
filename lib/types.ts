export type StreamingLink = string | { status: "coming-soon" };

export type Band = {
  name: string;
  location: string;
  email: string;
  bio: string;
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
  ticketsUrl?: string;
  venueAddress?: string;
  showTime?: string;
  doorsOpenTime?: string;
  coverFee?: string;
  posterFileName?: string;
  posterSrc?: string;
};

export type ShowBucket = "upcoming" | "past";

export type ShowsData = {
  upcoming: Show[];
  past: Show[];
};

export type ManagedShow = Show & {
  bucket: ShowBucket;
  sortOrder: number;
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

export type GalleryImage = {
  id: string;
  fileName: string;
  title: string;
  src?: string;
  byteSize: number;
  createdAt: string;
};

export type GalleryVideo = {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailFileName?: string;
  thumbnailSrc?: string;
  thumbnailByteSize?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
