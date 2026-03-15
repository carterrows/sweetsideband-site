"use client";

import Image from "next/image";
import { useMemo, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import type { ManagedShow, ShowBucket } from "@/lib/types";
import { deriveShowId } from "@/lib/show-id";

type EditableShow = ManagedShow & {
  clientKey: string;
  originalId: string | null;
  pendingPosterFile: File | null;
  pendingPosterName: string | null;
};

function createClientKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `show-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toEditableShow(show: ManagedShow): EditableShow {
  return {
    ...show,
    id: deriveShowId(show.date),
    clientKey: createClientKey(),
    originalId: show.id,
    pendingPosterFile: null,
    pendingPosterName: null
  };
}

function groupCount(shows: EditableShow[], bucket: ShowBucket) {
  return shows.filter((show) => show.bucket === bucket).length;
}

function createBlankShow(bucket: ShowBucket): EditableShow {
  const id = deriveShowId("");

  return {
    clientKey: createClientKey(),
    originalId: null,
    bucket,
    sortOrder: 0,
    id,
    date: "",
    city: "",
    venue: "",
    venueUrl: "",
    venueAddress: "",
    showTime: "",
    doorsOpenTime: "",
    coverFee: "",
    posterSrc: undefined,
    pendingPosterFile: null,
    pendingPosterName: null
  };
}

export default function AdminDashboard({
  initialShows
}: {
  initialShows: ManagedShow[];
}) {
  const router = useRouter();
  const initialStateRef = useRef<{
    shows: EditableShow[];
    selectedKey: string | null;
  } | null>(null);

  if (!initialStateRef.current) {
    const preparedShows = initialShows.map(toEditableShow);
    initialStateRef.current = {
      shows: preparedShows,
      selectedKey: preparedShows[0]?.clientKey ?? null
    };
  }

  const [shows, setShows] = useState(initialStateRef.current.shows);
  const [selectedKey, setSelectedKey] = useState(initialStateRef.current.selectedKey);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedShow = useMemo(
    () => shows.find((show) => show.clientKey === selectedKey) ?? null,
    [selectedKey, shows]
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
    setSelectedKey(clientKey);
    setFeedback(null);
    setError(null);
  };

  const updateShow = (clientKey: string, field: keyof EditableShow, value: string) => {
    setShows((currentShows) =>
      currentShows.map((show) =>
        show.clientKey === clientKey
          ? (() => {
              const updatedShow = {
                ...show,
                [field]: value
              };

              if (field === "date") {
                updatedShow.id = deriveShowId(value);
              }

              return updatedShow;
            })()
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
        bucket: show.bucket,
        date: show.date,
        city: show.city,
        venue: show.venue,
        venueUrl: show.venueUrl,
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
        const currentSelectedId = selectedShow ? deriveShowId(selectedShow.date) : null;
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
        setFeedback(
          "Changes synced. Public pages will refresh on the next request."
        );
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

  return (
    <div className="min-h-screen bg-haze/40">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-black/10 bg-paper p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                Admin
              </p>
              <h1 className="mt-2 font-display text-5xl uppercase text-ink-900">
                Shows
              </h1>
            </div>
          </div>
          <div className="mt-6 space-y-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700">
                  Upcoming
                </h2>
                <button
                  type="button"
                  onClick={() => addShow("upcoming")}
                  className="rounded-full border border-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:bg-accent hover:text-white"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {upcomingShows.map((show) => (
                  <button
                    key={show.clientKey}
                    type="button"
                    onClick={() => selectShow(show.clientKey)}
                    className={`flex w-full flex-col rounded-2xl border px-4 py-3 text-left transition ${
                      selectedKey === show.clientKey
                        ? "border-accent bg-accent text-white shadow-glow"
                        : "border-black/10 bg-white text-ink-900 hover:border-accent/30"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                      {show.date || "No date"}
                    </span>
                    <span className="mt-1 font-semibold">
                      {show.venue || "Untitled show"}
                    </span>
                    <span className="text-sm opacity-80">
                      {show.city || "City not set"}
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700">
                  Past
                </h2>
                <button
                  type="button"
                  onClick={() => addShow("past")}
                  className="rounded-full border border-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:bg-accent hover:text-white"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {pastShows.map((show) => (
                  <button
                    key={show.clientKey}
                    type="button"
                    onClick={() => selectShow(show.clientKey)}
                    className={`flex w-full flex-col rounded-2xl border px-4 py-3 text-left transition ${
                      selectedKey === show.clientKey
                        ? "border-accent bg-accent text-white shadow-glow"
                        : "border-black/10 bg-white text-ink-900 hover:border-accent/30"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                      {show.date || "No date"}
                    </span>
                    <span className="mt-1 font-semibold">
                      {show.venue || "Untitled show"}
                    </span>
                    <span className="text-sm opacity-80">
                      {show.city || "City not set"}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>
        <section className="rounded-[2rem] border border-black/10 bg-paper p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                Draft Workspace
              </p>
              <h2 className="mt-2 font-display text-4xl uppercase text-ink-900">
                {selectedShow ? selectedShow.venue || "Edit show" : "No show selected"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={deleteSelectedShow}
                disabled={!selectedShow}
                className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Show
              </button>
              <button
                type="button"
                onClick={syncChanges}
                disabled={isSyncing}
                className="rounded-full bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSyncing ? "Syncing..." : "Sync Changes"}
              </button>
            </div>
          </div>

          {feedback ? (
            <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedback}
            </p>
          ) : null}
          {error ? (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {selectedShow ? (
            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                    Show ID
                  </span>
                  <input
                    value={selectedShow.id}
                    readOnly
                    className="w-full rounded-2xl border border-black/10 bg-haze/40 px-4 py-3 text-ink-600 outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                    Bucket
                  </span>
                  <select
                    value={selectedShow.bucket}
                    onChange={(event) =>
                      moveShowToBucket(
                        selectedShow.clientKey,
                        event.target.value as ShowBucket
                      )
                    }
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                    Date
                  </span>
                  <input
                    type="date"
                    value={selectedShow.date}
                    onChange={(event) =>
                      updateShow(selectedShow.clientKey, "date", event.target.value)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                    City
                  </span>
                  <input
                    value={selectedShow.city}
                    onChange={(event) =>
                      updateShow(selectedShow.clientKey, "city", event.target.value)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                    Venue
                  </span>
                  <input
                    value={selectedShow.venue}
                    onChange={(event) =>
                      updateShow(selectedShow.clientKey, "venue", event.target.value)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                  />
                </label>
                {selectedShow.bucket === "upcoming" ? (
                  <>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                        Venue URL
                      </span>
                      <input
                        value={selectedShow.venueUrl ?? ""}
                        onChange={(event) =>
                          updateShow(selectedShow.clientKey, "venueUrl", event.target.value)
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                        Venue Address
                      </span>
                      <input
                        value={selectedShow.venueAddress ?? ""}
                        onChange={(event) =>
                          updateShow(
                            selectedShow.clientKey,
                            "venueAddress",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                        Show Time
                      </span>
                      <input
                        value={selectedShow.showTime ?? ""}
                        onChange={(event) =>
                          updateShow(selectedShow.clientKey, "showTime", event.target.value)
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                        Doors Open
                      </span>
                      <input
                        value={selectedShow.doorsOpenTime ?? ""}
                        onChange={(event) =>
                          updateShow(
                            selectedShow.clientKey,
                            "doorsOpenTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                        Cover Fee
                      </span>
                      <input
                        value={selectedShow.coverFee ?? ""}
                        onChange={(event) =>
                          updateShow(selectedShow.clientKey, "coverFee", event.target.value)
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                      />
                    </label>
                  </>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-black/10 px-4 py-5 text-sm text-ink-500 md:col-span-2">
                    Past shows only keep date, city, and venue. Additional venue details are cleared automatically when a show is moved to past.
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-[1.5rem] border border-black/10 bg-white p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    Poster
                  </p>
                  <p className="mt-2 text-sm text-ink-600">
                    Upload any PNG file. Its original filename will be stored and
                    reused even if the show date changes.
                  </p>
                  {selectedShow.posterFileName ? (
                    <p className="text-sm text-ink-600">
                      Current poster file:{" "}
                      <span className="font-semibold text-ink-900">
                        {selectedShow.posterFileName}
                      </span>
                    </p>
                  ) : null}
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:bg-accent hover:text-white">
                  Choose PNG
                  <input
                    type="file"
                    accept=".png,image/png"
                    className="sr-only"
                    onChange={(event) => onPosterChange(event.target.files)}
                  />
                </label>
                {selectedShow.pendingPosterName ? (
                  <p className="text-sm text-ink-600">
                    Pending upload: {selectedShow.pendingPosterName}
                  </p>
                ) : null}
                {selectedShow.posterSrc ? (
                  <div className="overflow-hidden rounded-[1.25rem] border border-black/10">
                    <Image
                      src={selectedShow.posterSrc}
                      alt={`${selectedShow.venue || "Show"} poster`}
                      width={900}
                      height={1200}
                      unoptimized
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-ink-500">
                    No poster uploaded yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-black/10 px-6 py-16 text-center text-sm text-ink-500">
              Select a show from the left or add a new one to begin editing.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
