
export default function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#55715B]">
          {eyebrow}
        </p>
      )}

      <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-[#21382B] sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 text-sm leading-6 text-[#667267] sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
