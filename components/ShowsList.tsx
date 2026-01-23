import type { Show } from "@/lib/types";
import ShowCard from "./ShowCard";

export default function ShowsList({
  shows
}: {
  shows: Show[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  );
}
