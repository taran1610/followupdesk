const TRUST_ITEMS = [
  "Coaches & consultants",
  "Marketing agencies",
  "Independent advisors",
  "Service businesses",
];

export function SocialProof() {
  return (
    <section className="border-border/60 border-y py-8">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="text-muted-foreground mb-4 text-center text-xs font-medium tracking-wide uppercase">
          Built for relationship-led businesses
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="text-muted-foreground/80 text-sm font-medium">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
