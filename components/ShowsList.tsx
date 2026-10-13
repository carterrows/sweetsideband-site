import type { Show } from "@/lib/types";
import ShowCard from "./ShowCard";

export default function ShowsList({
  shows,
  showDetails = false,
  emptyMessage
}: {
  shows: Show[];
  showDetails?: boolean;
  emptyMessage?: string;
}) {
  if (shows.length === 0 && emptyMessage) {
    return <p className="text-base text-ink-600">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-black/10">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} showDetails={showDetails} />
      ))}
    </ul>
  );
}
