import type { Show } from "@/lib/types";
import ShowCard from "./ShowCard";

export default function ShowsList({
  shows
}: {
  shows: Show[];
}) {
  return (
    <ul className="flex flex-col divide-y divide-black/10">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </ul>
  );
}
