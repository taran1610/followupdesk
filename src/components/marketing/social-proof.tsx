const TRUST_ITEMS = [
  "Coaches & consultants",
  "Marketing agencies",
  "Independent advisors",
  "Service businesses",
];

export function SocialProof() {
  return (
    <section className="border-y border-[#e8e4dc] py-8">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="marketing-label mb-4 text-center">
          Built for relationship-led businesses
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-[#6b6560]">
          {TRUST_ITEMS.map((item, i) => (
            <span key={item} className="flex items-center gap-3">
              {i > 0 && <span className="hidden text-[#d4cfc6] sm:inline">·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
