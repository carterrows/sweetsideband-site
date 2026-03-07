import type { Show } from "@/lib/types";
import ShowCard from "./ShowCard";

export default function ShowsList({
  shows,
  showDetails = false
}: {
  shows: Show[];
  showDetails?: boolean;
}) {
  return (
    <ul className="flex flex-col divide-y divide-black/10">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} showDetails={showDetails} />
      ))}
    </ul>
  );
}
