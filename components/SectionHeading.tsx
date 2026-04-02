export default function SectionHeading({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  const heading = subtitle ?? title;

  return (
    <div>
      <h2 className="text-3xl font-semibold text-accent md:text-4xl">
        {heading}
      </h2>
    </div>
  );
}
