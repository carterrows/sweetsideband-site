export default function SectionHeading({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-[0.35em] text-accent">
        {title}
      </p>
      {subtitle && (
        <h2 className="text-3xl font-semibold text-ink-900 md:text-4xl">
          {subtitle}
        </h2>
      )}
    </div>
  );
}
