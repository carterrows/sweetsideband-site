"use client";

import Image from "next/image";
import {
  CalendarDays,
  Images as ImagesIcon,
  Plus,
  Save,
  Trash2,
  Upload,
  Video
} from "lucide-react";
import { useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import type {
  GalleryImage,
  GalleryVideo,
  ManagedShow,
  ShowBucket
} from "@/lib/types";
import { generateShowId } from "@/lib/show-id";

type EditableShow = ManagedShow & {
  clientKey: string;
  originalId: string | null;
  pendingPosterFile: File | null;
  pendingPosterName: string | null;
};

type EditableVideo = GalleryVideo & {
  clientKey: string;
  originalId: string | null;
  pendingThumbnailFile: File | null;
  pendingThumbnailName: string | null;
};

type AdminTab = "shows" | "videos" | "images";

const MAX_VIDEO_THUMBNAIL_BYTES = 250 * 1024;

function createClientKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `show-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatByteSize(byteSize: number) {
  return `${(byteSize / 1024).toFixed(0)} KB`;
}

function toEditableShow(show: ManagedShow): EditableShow {
  return {
    ...show,
    clientKey: createClientKey(),
    originalId: show.id,
    pendingPosterFile: null,
    pendingPosterName: null
  };
}

function toEditableVideo(video: GalleryVideo): EditableVideo {
  return {
    ...video,
    clientKey: createClientKey(),
    originalId: video.id,
    pendingThumbnailFile: null,
    pendingThumbnailName: null
  };
}

function groupCount(shows: EditableShow[], bucket: ShowBucket) {
  return shows.filter((show) => show.bucket === bucket).length;
}

function createBlankShow(bucket: ShowBucket): EditableShow {
  return {
    clientKey: createClientKey(),
    originalId: null,
    bucket,
    sortOrder: 0,
    id: generateShowId(),
    date: "",
    city: "",
    venue: "",
    venueUrl: "",
    ticketsUrl: "",
    venueAddress: "",
    showTime: "",
    doorsOpenTime: "",
    coverFee: "",
    posterSrc: undefined,
    pendingPosterFile: null,
    pendingPosterName: null
  };
}

function createBlankVideo(): EditableVideo {
  const now = new Date().toISOString();

  return {
    clientKey: createClientKey(),
    originalId: null,
    id: "",
    title: "",
    youtubeUrl: "",
    thumbnailFileName: undefined,
    thumbnailSrc: undefined,
    thumbnailByteSize: undefined,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    pendingThumbnailFile: null,
    pendingThumbnailName: null
  };
}

export default function AdminDashboard({
  initialShows,
  initialImages,
  initialVideos
}: {
  initialShows: ManagedShow[];
  initialImages: GalleryImage[];
  initialVideos: GalleryVideo[];
}) {
  const router = useRouter();
  const [initialState] = useState<{
    shows: EditableShow[];
    images: GalleryImage[];
    videos: EditableVideo[];
    selectedKey: string | null;
    selectedVideoKey: string | null;
  }>(() => {
    const preparedShows = initialShows.map(toEditableShow);
    const preparedVideos = initialVideos.map(toEditableVideo);

    return {
      shows: preparedShows,
      images: initialImages,
      videos: preparedVideos,
      selectedKey: preparedShows[0]?.clientKey ?? null,
      selectedVideoKey: preparedVideos[0]?.clientKey ?? null
    };
  });

  const [shows, setShows] = useState(initialState.shows);
  const [images, setImages] = useState(initialState.images);
  const [videos, setVideos] = useState(initialState.videos);
  const [selectedKey, setSelectedKey] = useState(initialState.selectedKey);
  const [selectedVideoKey, setSelectedVideoKey] = useState(
    initialState.selectedVideoKey
  );
  const [activeTab, setActiveTab] = useState<AdminTab>("shows");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [videoFeedback, setVideoFeedback] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isSyncingVideos, setIsSyncingVideos] = useState(false);
  const [imageFeedback, setImageFeedback] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const selectedShow = useMemo(
    () => shows.find((show) => show.clientKey === selectedKey) ?? null,
    [selectedKey, shows]
  );

  const selectedVideo = useMemo(
    () => videos.find((video) => video.clientKey === selectedVideoKey) ?? null,
    [selectedVideoKey, videos]
  );

  const upcomingShows = useMemo(
    () => shows.filter((show) => show.bucket === "upcoming"),
    [shows]
  );
  const pastShows = useMemo(
    () => shows.filter((show) => show.bucket === "past"),
    [shows]
  );

  const selectShow = (clientKey: string) => {
    setActiveTab("shows");
    setSelectedKey(clientKey);
    setFeedback(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectVideo = (clientKey: string) => {
    setActiveTab("videos");
    setSelectedVideoKey(clientKey);
    setVideoFeedback(null);
    setVideoError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setFeedback(null);
    setError(null);
    setVideoFeedback(null);
    setVideoError(null);
    setImageFeedback(null);
    setImageError(null);
  };

  const updateShow = (clientKey: string, field: keyof EditableShow, value: string) => {
    setShows((currentShows) =>
      currentShows.map((show) =>
        show.clientKey === clientKey
          ? {
              ...show,
              [field]: value
            }
          : show
      )
    );
    setFeedback(null);
    setError(null);
  };

  const moveShowToBucket = (clientKey: string, bucket: ShowBucket) => {
    setShows((currentShows) => {
      const nextShows = currentShows.map((show) =>
        show.clientKey === clientKey
          ? {
              ...show,
              bucket,
              venueUrl: bucket === "past" ? undefined : show.venueUrl,
              ticketsUrl: bucket === "past" ? undefined : show.ticketsUrl,
              venueAddress: bucket === "past" ? undefined : show.venueAddress,
              showTime: bucket === "past" ? undefined : show.showTime,
              doorsOpenTime: bucket === "past" ? undefined : show.doorsOpenTime,
              coverFee: bucket === "past" ? undefined : show.coverFee
            }
          : show
      );
      const remaining = nextShows.filter((show) => show.clientKey !== clientKey);
      const updated = nextShows.find((show) => show.clientKey === clientKey);

      if (!updated) {
        return currentShows;
      }

      const insertionIndex =
        bucket === "upcoming"
          ? remaining.filter((show) => show.bucket === "upcoming").length
          : remaining.length;

      remaining.splice(insertionIndex, 0, updated);
      return remaining;
    });
    setFeedback(null);
    setError(null);
  };

  const addShow = (bucket: ShowBucket) => {
    const nextShow = createBlankShow(bucket);
    setShows((currentShows) => {
      if (bucket === "past") {
        return [...currentShows, nextShow];
      }

      const upcomingCount = groupCount(currentShows, "upcoming");
      const nextShows = [...currentShows];
      nextShows.splice(upcomingCount, 0, nextShow);
      return nextShows;
    });
    setSelectedKey(nextShow.clientKey);
    setFeedback(null);
    setError(null);
  };

  const deleteSelectedShow = () => {
    if (!selectedShow) {
      return;
    }

    setShows((currentShows) => {
      const remainingShows = currentShows.filter(
        (show) => show.clientKey !== selectedShow.clientKey
      );
      setSelectedKey(remainingShows[0]?.clientKey ?? null);
      return remainingShows;
    });
    setFeedback(null);
    setError(null);
  };

  const onPosterChange = (fileList: FileList | null) => {
    if (!selectedShow) {
      return;
    }

    const file = fileList?.[0] ?? null;

    if (!file) {
      setShows((currentShows) =>
        currentShows.map((show) =>
          show.clientKey === selectedShow.clientKey
            ? {
                ...show,
                pendingPosterFile: null,
                pendingPosterName: null
              }
            : show
        )
      );
      return;
    }

    if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
      setError("Poster files must use the .png extension.");
      return;
    }

    setShows((currentShows) =>
      currentShows.map((show) =>
        show.clientKey === selectedShow.clientKey
            ? {
                ...show,
                pendingPosterFile: file,
                pendingPosterName: file.name
              }
            : show
      )
    );
    setFeedback(null);
    setError(null);
  };

  const syncChanges = () => {
    setFeedback(null);
    setError(null);
    setIsSyncing(true);

    void (async () => {
      const formData = new FormData();
      const payload = shows.map((show) => ({
        clientKey: show.clientKey,
        originalId: show.originalId,
        id: show.id,
        bucket: show.bucket,
        date: show.date,
        city: show.city,
        venue: show.venue,
        venueUrl: show.venueUrl,
        ticketsUrl: show.ticketsUrl,
        venueAddress: show.venueAddress,
        showTime: show.showTime,
        doorsOpenTime: show.doorsOpenTime,
        coverFee: show.coverFee
      }));

      formData.set("payload", JSON.stringify(payload));

      for (const show of shows) {
        if (show.pendingPosterFile) {
          formData.append(`poster:${show.clientKey}`, show.pendingPosterFile);
        }
      }

      try {
        const currentSelectedId = selectedShow?.id ?? null;
        const response = await fetch("/api/admin/sync", {
          method: "POST",
          body: formData
        });
        const result = (await response.json()) as {
          error?: string;
          shows?: ManagedShow[];
        };

        if (!response.ok || !result.shows) {
          setError(result.error ?? "Sync failed.");
          return;
        }

        const refreshedShows = result.shows.map(toEditableShow);
        setShows(refreshedShows);
        setSelectedKey(
          refreshedShows.find((show) => show.id === currentSelectedId)?.clientKey ??
            refreshedShows[0]?.clientKey ??
            null
        );
        setFeedback("Show changes saved successfully.");
        startTransition(() => {
          router.refresh();
        });
      } catch {
        setError("Sync failed.");
      } finally {
        setIsSyncing(false);
      }
    })();
  };

  const addVideo = () => {
    const nextVideo = createBlankVideo();

    setVideos((currentVideos) => [...currentVideos, nextVideo]);
    setSelectedVideoKey(nextVideo.clientKey);
    setActiveTab("videos");
    setVideoFeedback(null);
    setVideoError(null);
  };

  const updateVideo = (
    clientKey: string,
    field: "title" | "youtubeUrl",
    value: string
  ) => {
    setVideos((currentVideos) =>
      currentVideos.map((video) =>
        video.clientKey === clientKey
          ? {
              ...video,
              [field]: value
            }
          : video
      )
    );
    setVideoFeedback(null);
    setVideoError(null);
  };

  const deleteSelectedVideo = () => {
    if (!selectedVideo) {
      return;
    }

    setVideos((currentVideos) => {
      const remainingVideos = currentVideos.filter(
        (video) => video.clientKey !== selectedVideo.clientKey
      );
      setSelectedVideoKey(remainingVideos[0]?.clientKey ?? null);
      return remainingVideos;
    });
    setVideoFeedback(null);
    setVideoError(null);
  };

  const onVideoThumbnailChange = (fileList: FileList | null) => {
    if (!selectedVideo) {
      return;
    }

    const file = fileList?.[0] ?? null;

    if (!file) {
      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video.clientKey === selectedVideo.clientKey
            ? {
                ...video,
                pendingThumbnailFile: null,
                pendingThumbnailName: null
              }
            : video
        )
      );
      return;
    }

    const lowerName = file.name.toLowerCase();

    if (
      !lowerName.endsWith(".jpg") &&
      !lowerName.endsWith(".jpeg") &&
      !lowerName.endsWith(".png")
    ) {
      setVideoError("Video thumbnails must use .jpg, .jpeg, or .png.");
      return;
    }

    if (file.size > MAX_VIDEO_THUMBNAIL_BYTES) {
      setVideoError("Each video thumbnail must be 250 KB or smaller.");
      return;
    }

    setVideos((currentVideos) =>
      currentVideos.map((video) =>
        video.clientKey === selectedVideo.clientKey
          ? {
              ...video,
              pendingThumbnailFile: file,
              pendingThumbnailName: file.name
            }
          : video
      )
    );
    setVideoFeedback(null);
    setVideoError(null);
  };

  const syncGalleryVideos = () => {
    setVideoFeedback(null);
    setVideoError(null);
    setIsSyncingVideos(true);

    void (async () => {
      const formData = new FormData();
      const payload = videos.map((video) => ({
        clientKey: video.clientKey,
        originalId: video.originalId,
        title: video.title,
        youtubeUrl: video.youtubeUrl
      }));

      formData.set("payload", JSON.stringify(payload));

      for (const video of videos) {
        if (video.pendingThumbnailFile) {
          formData.append(
            `thumbnail:${video.clientKey}`,
            video.pendingThumbnailFile
          );
        }
      }

      try {
        const currentSelectedId = selectedVideo?.originalId ?? null;
        const response = await fetch("/api/admin/gallery-videos", {
          method: "POST",
          body: formData
        });
        const result = (await response.json()) as {
          error?: string;
          videos?: GalleryVideo[];
        };

        if (!response.ok || !result.videos) {
          setVideoError(result.error ?? "Unable to save videos.");
          return;
        }

        const refreshedVideos = result.videos.map(toEditableVideo);
        setVideos(refreshedVideos);
        setSelectedVideoKey(
          refreshedVideos.find((video) => video.id === currentSelectedId)
            ?.clientKey ??
            refreshedVideos[0]?.clientKey ??
            null
        );
        setVideoFeedback("Video changes saved successfully.");
        startTransition(() => {
          router.refresh();
        });
      } catch {
        setVideoError("Unable to save videos.");
      } finally {
        setIsSyncingVideos(false);
      }
    })();
  };

  const uploadGalleryImages = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);

    setImageFeedback(null);
    setImageError(null);

    if (files.length === 0) {
      return;
    }

    for (const file of files) {
      const lowerName = file.name.toLowerCase();

      if (!lowerName.endsWith(".jpg") && !lowerName.endsWith(".jpeg")) {
        setImageError("Gallery images must use the .jpg or .jpeg extension.");
        return;
      }

      if (file.size > 1024 * 1024) {
        setImageError("Each gallery image must be 1 MB or smaller.");
        return;
      }
    }

    setIsUploadingImages(true);

    void (async () => {
      const formData = new FormData();

      for (const file of files) {
        formData.append("images", file);
      }

      try {
        const response = await fetch("/api/admin/gallery-images", {
          method: "POST",
          body: formData
        });
        const result = (await response.json()) as {
          error?: string;
          images?: GalleryImage[];
        };

        if (!response.ok || !result.images) {
          setImageError(result.error ?? "Image upload failed.");
          return;
        }

        setImages(result.images);
        setImageFeedback(
          files.length === 1
            ? "Photo uploaded successfully."
            : `${files.length} photos uploaded successfully.`
        );
        startTransition(() => {
          router.refresh();
        });
      } catch {
        setImageError("Image upload failed.");
      } finally {
        setIsUploadingImages(false);
      }
    })();
  };

  const deleteGalleryImage = (imageId: string) => {
    setImageFeedback(null);
    setImageError(null);
    setDeletingImageId(imageId);

    void (async () => {
      try {
        const response = await fetch("/api/admin/gallery-images", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id: imageId })
        });
        const result = (await response.json()) as {
          error?: string;
          images?: GalleryImage[];
        };

        if (!response.ok || !result.images) {
          setImageError(result.error ?? "Image delete failed.");
          return;
        }

        setImages(result.images);
        setImageFeedback("Photo deleted successfully.");
        startTransition(() => {
          router.refresh();
        });
      } catch {
        setImageError("Image delete failed.");
      } finally {
        setDeletingImageId(null);
      }
    })();
  };

  const tabs = [
    {
      id: "shows" as const,
      label: "Shows",
      icon: CalendarDays,
      count: shows.length
    },
    {
      id: "videos" as const,
      label: "Videos",
      icon: Video,
      count: videos.length
    },
    {
      id: "images" as const,
      label: "Photos",
      icon: ImagesIcon,
      count: images.length
    }
  ];

  const fieldClass =
    "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-600/45 focus:border-accent focus:ring-4 focus:ring-accent/10";
  const labelClass =
    "mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-600";
  const primaryButtonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#df5d40] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryButtonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-700 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50";
  const dangerButtonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="min-h-screen bg-[#f5efe3]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#fffdf8]/95 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                Sweetside
              </p>
              <h1 className="mt-1 font-display text-3xl uppercase leading-none text-ink-900">
                Website manager
              </h1>
            </div>
            <div className="lg:hidden">
              <AdminLogoutButton />
            </div>
          </div>

          <nav
            aria-label="Website content"
            className="grid grid-cols-3 gap-1 rounded-2xl border border-black/10 bg-[#f6f0e5] p-1.5 lg:min-w-[32rem]"
          >
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => selectTab(id)}
                aria-pressed={activeTab === id}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
                  activeTab === id
                    ? "bg-white text-ink-900 shadow-sm"
                    : "text-ink-600 hover:bg-white/60 hover:text-ink-900"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  size={17}
                  strokeWidth={activeTab === id ? 2.4 : 2}
                  className={activeTab === id ? "text-accent" : ""}
                />
                <span>{label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    activeTab === id
                      ? "bg-accent/10 text-accent"
                      : "bg-black/5 text-ink-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </nav>

          <div className="hidden lg:block">
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {activeTab === "images" ? (
        <main className="w-full p-4 sm:p-6 lg:p-8">
          <section className="overflow-hidden rounded-3xl border border-black/10 bg-[#fffdf8] shadow-sm">
            <div className="flex flex-col gap-5 border-b border-black/10 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Photo gallery
                </p>
                <h2 className="mt-2 font-display text-4xl uppercase leading-none text-ink-900 sm:text-5xl">
                  Manage photos
                </h2>
                <p className="mt-3 text-sm text-ink-600">
                  JPG or JPEG · Maximum 1 MB per photo
                </p>
              </div>
              <label className={`${primaryButtonClass} cursor-pointer ${
                isUploadingImages ? "pointer-events-none opacity-60" : ""
              }`}>
                <Upload aria-hidden="true" size={17} />
                {isUploadingImages ? "Uploading..." : "Upload photos"}
                <input
                  type="file"
                  accept=".jpg,.jpeg,image/jpeg"
                  multiple
                  disabled={isUploadingImages}
                  className="sr-only"
                  onChange={(event) => {
                    uploadGalleryImages(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            {(imageFeedback || imageError) && (
              <div className="px-5 pt-5 sm:px-7">
                {imageFeedback ? (
                  <p
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  >
                    {imageFeedback}
                  </p>
                ) : null}
                {imageError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {imageError}
                  </p>
                ) : null}
              </div>
            )}

            {images.length > 0 ? (
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3 2xl:grid-cols-4">
                {images.map((image) => (
                  <article
                    key={image.id}
                    className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {image.src ? (
                      <Image
                        src={image.src}
                        alt={image.title}
                        width={900}
                        height={700}
                        unoptimized
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-haze/60 px-6 text-center text-sm text-ink-500">
                        Photo unavailable
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-ink-900">
                          {image.title}
                        </h3>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-500">
                          {formatByteSize(image.byteSize)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteGalleryImage(image.id)}
                        disabled={deletingImageId === image.id}
                        aria-label={`Delete ${image.title}`}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 aria-hidden="true" size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="m-5 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white/50 px-6 text-center sm:m-7">
                <ImagesIcon aria-hidden="true" size={34} className="text-accent" />
                <h3 className="mt-4 font-display text-3xl uppercase text-ink-900">
                  No photos yet
                </h3>
                <p className="mt-2 max-w-sm text-sm text-ink-600">
                  Upload photos to start building the gallery.
                </p>
              </div>
            )}
          </section>
        </main>
      ) : (
        <div className="grid min-h-[calc(100vh-93px)] lg:grid-cols-[21rem_minmax(0,1fr)]">
          <aside className="border-b border-black/10 bg-[#eee4d3] lg:sticky lg:top-[93px] lg:h-[calc(100vh-93px)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="p-4 sm:p-5">
              {activeTab === "shows" ? (
                <div className="space-y-6">
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-700">
                          Upcoming
                        </h2>
                        <p className="mt-1 text-xs text-ink-600">
                          {upcomingShows.length} {upcomingShows.length === 1 ? "show" : "shows"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addShow("upcoming")}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#df5d40]"
                      >
                        <Plus aria-hidden="true" size={15} />
                        Add
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                      {upcomingShows.map((show) => (
                        <button
                          key={show.clientKey}
                          type="button"
                          onClick={() => selectShow(show.clientKey)}
                          className={`min-w-64 rounded-xl border px-4 py-3 text-left transition lg:w-full ${
                            selectedKey === show.clientKey
                              ? "border-accent bg-white shadow-sm ring-2 ring-accent/15"
                              : "border-black/10 bg-white/65 hover:border-accent/40 hover:bg-white"
                          }`}
                        >
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                            {show.date || "Date needed"}
                          </span>
                          <span className="mt-1 block truncate font-semibold text-ink-900">
                            {show.venue || "Untitled show"}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-ink-600">
                            {show.city || "City needed"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-700">
                          Past
                        </h2>
                        <p className="mt-1 text-xs text-ink-600">
                          {pastShows.length} {pastShows.length === 1 ? "show" : "shows"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addShow("past")}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-700 transition hover:border-accent hover:text-accent"
                      >
                        <Plus aria-hidden="true" size={15} />
                        Add
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                      {pastShows.map((show) => (
                        <button
                          key={show.clientKey}
                          type="button"
                          onClick={() => selectShow(show.clientKey)}
                          className={`min-w-64 rounded-xl border px-4 py-3 text-left transition lg:w-full ${
                            selectedKey === show.clientKey
                              ? "border-accent bg-white shadow-sm ring-2 ring-accent/15"
                              : "border-black/10 bg-white/65 hover:border-accent/40 hover:bg-white"
                          }`}
                        >
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                            {show.date || "Date needed"}
                          </span>
                          <span className="mt-1 block truncate font-semibold text-ink-900">
                            {show.venue || "Untitled show"}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-ink-600">
                            {show.city || "City needed"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-700">
                        All videos
                      </h2>
                      <p className="mt-1 text-xs text-ink-600">
                        {videos.length} {videos.length === 1 ? "video" : "videos"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addVideo}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#df5d40]"
                    >
                      <Plus aria-hidden="true" size={15} />
                      Add
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                    {videos.map((video) => (
                      <button
                        key={video.clientKey}
                        type="button"
                        onClick={() => selectVideo(video.clientKey)}
                        className={`min-w-64 rounded-xl border px-4 py-3 text-left transition lg:w-full ${
                          selectedVideoKey === video.clientKey
                            ? "border-accent bg-white shadow-sm ring-2 ring-accent/15"
                            : "border-black/10 bg-white/65 hover:border-accent/40 hover:bg-white"
                        }`}
                      >
                        <span className="block truncate font-semibold text-ink-900">
                          {video.title || "Untitled video"}
                        </span>
                        <span className="mt-1 block truncate text-xs text-ink-600">
                          {video.youtubeUrl || "YouTube link needed"}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>

          <main className="min-w-0 p-4 sm:p-6 xl:p-8">
            {activeTab === "videos" ? (
              <section className="overflow-hidden rounded-3xl border border-black/10 bg-[#fffdf8] shadow-sm">
                <div className="flex flex-col gap-5 border-b border-black/10 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                      Video details
                    </p>
                    <h2 className="mt-2 truncate font-display text-4xl uppercase leading-none text-ink-900 sm:text-5xl">
                      {selectedVideo
                        ? selectedVideo.title || "New video"
                        : "Choose a video"}
                    </h2>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={deleteSelectedVideo}
                      disabled={!selectedVideo}
                      className={dangerButtonClass}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={syncGalleryVideos}
                      disabled={isSyncingVideos}
                      className={primaryButtonClass}
                    >
                      <Save aria-hidden="true" size={16} />
                      {isSyncingVideos ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>

                {(videoFeedback || videoError) && (
                  <div className="px-5 pt-5 sm:px-7">
                    {videoFeedback ? (
                      <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {videoFeedback}
                      </p>
                    ) : null}
                    {videoError ? (
                      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {videoError}
                      </p>
                    ) : null}
                  </div>
                )}

                {selectedVideo ? (
                  <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
                    <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                      <h3 className="font-display text-2xl uppercase text-ink-900">
                        Video information
                      </h3>
                      <div className="mt-5 grid gap-5">
                        <label>
                          <span className={labelClass}>Title</span>
                          <input
                            value={selectedVideo.title}
                            placeholder="e.g. Superstition – Live Cover"
                            onChange={(event) =>
                              updateVideo(
                                selectedVideo.clientKey,
                                "title",
                                event.target.value
                              )
                            }
                            className={fieldClass}
                          />
                        </label>
                        <label>
                          <span className={labelClass}>YouTube link</span>
                          <input
                            type="url"
                            value={selectedVideo.youtubeUrl}
                            placeholder="https://youtube.com/watch?v=..."
                            onChange={(event) =>
                              updateVideo(
                                selectedVideo.clientKey,
                                "youtubeUrl",
                                event.target.value
                              )
                            }
                            className={fieldClass}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl uppercase text-ink-900">
                            Thumbnail
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-ink-600">
                            JPG, JPEG, or PNG · Maximum 250 KB
                          </p>
                        </div>
                        <label className={`${secondaryButtonClass} cursor-pointer`}>
                          <Upload aria-hidden="true" size={16} />
                          Choose
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            className="sr-only"
                            onChange={(event) => {
                              onVideoThumbnailChange(event.target.files);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                      </div>

                      {selectedVideo.pendingThumbnailName ? (
                        <p className="mt-4 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
                          Ready to upload: {selectedVideo.pendingThumbnailName}
                        </p>
                      ) : null}

                      <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-haze/40">
                        {selectedVideo.thumbnailSrc ? (
                          <Image
                            src={selectedVideo.thumbnailSrc}
                            alt={`${selectedVideo.title || "Video"} thumbnail`}
                            width={900}
                            height={506}
                            unoptimized
                            className="aspect-video w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-ink-500">
                            No thumbnail selected
                          </div>
                        )}
                      </div>

                      {selectedVideo.thumbnailByteSize ? (
                        <p className="mt-3 text-xs text-ink-500">
                          Current size: {formatByteSize(selectedVideo.thumbnailByteSize)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                    <Video aria-hidden="true" size={34} className="text-accent" />
                    <h3 className="mt-4 font-display text-3xl uppercase text-ink-900">
                      Choose a video
                    </h3>
                    <p className="mt-2 text-sm text-ink-600">
                      Select one from the list or add a new video.
                    </p>
                  </div>
                )}
              </section>
            ) : (
              <section className="overflow-hidden rounded-3xl border border-black/10 bg-[#fffdf8] shadow-sm">
                <div className="flex flex-col gap-5 border-b border-black/10 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                      Show details
                    </p>
                    <h2 className="mt-2 truncate font-display text-4xl uppercase leading-none text-ink-900 sm:text-5xl">
                      {selectedShow
                        ? selectedShow.venue || "New show"
                        : "Choose a show"}
                    </h2>
                    {selectedShow ? (
                      <p className="mt-2 text-sm text-ink-600">
                        {selectedShow.date || "Date needed"} · {selectedShow.city || "City needed"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={deleteSelectedShow}
                      disabled={!selectedShow}
                      className={dangerButtonClass}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={syncChanges}
                      disabled={isSyncing}
                      className={primaryButtonClass}
                    >
                      <Save aria-hidden="true" size={16} />
                      {isSyncing ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>

                {(feedback || error) && (
                  <div className="px-5 pt-5 sm:px-7">
                    {feedback ? (
                      <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {feedback}
                      </p>
                    ) : null}
                    {error ? (
                      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </p>
                    ) : null}
                  </div>
                )}

                {selectedShow ? (
                  <div className="grid gap-5 p-5 sm:p-7 2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_22rem]">
                    <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                      <h3 className="font-display text-2xl uppercase text-ink-900">
                        Event basics
                      </h3>
                      <div className="mt-5 grid gap-5">
                        <label>
                          <span className={labelClass}>Status</span>
                          <select
                            value={selectedShow.bucket}
                            onChange={(event) =>
                              moveShowToBucket(
                                selectedShow.clientKey,
                                event.target.value as ShowBucket
                              )
                            }
                            className={fieldClass}
                          >
                            <option value="upcoming">Upcoming show</option>
                            <option value="past">Past show</option>
                          </select>
                        </label>
                        <label>
                          <span className={labelClass}>Date</span>
                          <input
                            type="date"
                            value={selectedShow.date}
                            onChange={(event) =>
                              updateShow(
                                selectedShow.clientKey,
                                "date",
                                event.target.value
                              )
                            }
                            className={fieldClass}
                          />
                        </label>
                        <label>
                          <span className={labelClass}>Venue</span>
                          <input
                            value={selectedShow.venue}
                            placeholder="Venue name"
                            onChange={(event) =>
                              updateShow(
                                selectedShow.clientKey,
                                "venue",
                                event.target.value
                              )
                            }
                            className={fieldClass}
                          />
                        </label>
                        <label>
                          <span className={labelClass}>City</span>
                          <input
                            value={selectedShow.city}
                            placeholder="e.g. Toronto, ON"
                            onChange={(event) =>
                              updateShow(
                                selectedShow.clientKey,
                                "city",
                                event.target.value
                              )
                            }
                            className={fieldClass}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                      <h3 className="font-display text-2xl uppercase text-ink-900">
                        {selectedShow.bucket === "upcoming"
                          ? "Timing & tickets"
                          : "Past show"}
                      </h3>
                      {selectedShow.bucket === "upcoming" ? (
                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                          <label className="md:col-span-2">
                            <span className={labelClass}>Venue address</span>
                            <input
                              value={selectedShow.venueAddress ?? ""}
                              placeholder="Street address"
                              onChange={(event) =>
                                updateShow(
                                  selectedShow.clientKey,
                                  "venueAddress",
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </label>
                          <label>
                            <span className={labelClass}>Doors open</span>
                            <input
                              value={selectedShow.doorsOpenTime ?? ""}
                              placeholder="e.g. 8:00 PM"
                              onChange={(event) =>
                                updateShow(
                                  selectedShow.clientKey,
                                  "doorsOpenTime",
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </label>
                          <label>
                            <span className={labelClass}>Show time</span>
                            <input
                              value={selectedShow.showTime ?? ""}
                              placeholder="e.g. 9:00 PM"
                              onChange={(event) =>
                                updateShow(
                                  selectedShow.clientKey,
                                  "showTime",
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </label>
                          <label>
                            <span className={labelClass}>Cover fee</span>
                            <input
                              value={selectedShow.coverFee ?? ""}
                              placeholder="e.g. $10"
                              onChange={(event) =>
                                updateShow(
                                  selectedShow.clientKey,
                                  "coverFee",
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </label>
                          <label>
                            <span className={labelClass}>Venue website</span>
                            <input
                              type="url"
                              value={selectedShow.venueUrl ?? ""}
                              placeholder="https://..."
                              onChange={(event) =>
                                updateShow(
                                  selectedShow.clientKey,
                                  "venueUrl",
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </label>
                          <label className="md:col-span-2">
                            <span className={labelClass}>Ticket link</span>
                            <input
                              type="url"
                              value={selectedShow.ticketsUrl ?? ""}
                              placeholder="https://..."
                              onChange={(event) =>
                                updateShow(
                                  selectedShow.clientKey,
                                  "ticketsUrl",
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-xl bg-haze/55 p-5 text-sm leading-relaxed text-ink-600">
                          Past shows only need a date, venue, and city. Ticket,
                          timing, and poster details will be cleared when you save.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-2xl uppercase text-ink-900">
                            Poster
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-ink-600">
                            {selectedShow.bucket === "upcoming"
                              ? "PNG only · Maximum 5 MB"
                              : "Posters are not shown for past events."}
                          </p>
                        </div>
                        {selectedShow.bucket === "upcoming" ? (
                          <label className={`${secondaryButtonClass} cursor-pointer`}>
                            <Upload aria-hidden="true" size={16} />
                            Choose
                            <input
                              type="file"
                              accept=".png,image/png"
                              className="sr-only"
                              onChange={(event) =>
                                onPosterChange(event.target.files)
                              }
                            />
                          </label>
                        ) : null}
                      </div>

                      {selectedShow.pendingPosterName ? (
                        <p className="mt-4 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
                          Ready to upload: {selectedShow.pendingPosterName}
                        </p>
                      ) : null}

                      <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-haze/40">
                        {selectedShow.bucket === "upcoming" &&
                        selectedShow.posterSrc ? (
                          <Image
                            src={selectedShow.posterSrc}
                            alt={`${selectedShow.venue || "Show"} poster`}
                            width={900}
                            height={1200}
                            unoptimized
                            className="h-auto max-h-[32rem] w-full object-contain"
                          />
                        ) : (
                          <div className="flex min-h-52 items-center justify-center px-6 text-center text-sm text-ink-500">
                            {selectedShow.bucket === "upcoming"
                              ? "No poster selected"
                              : "No poster needed"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                    <CalendarDays
                      aria-hidden="true"
                      size={34}
                      className="text-accent"
                    />
                    <h3 className="mt-4 font-display text-3xl uppercase text-ink-900">
                      Choose a show
                    </h3>
                    <p className="mt-2 text-sm text-ink-600">
                      Select one from the list or add a new show.
                    </p>
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
