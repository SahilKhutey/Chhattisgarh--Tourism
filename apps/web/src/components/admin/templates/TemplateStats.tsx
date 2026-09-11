interface Props {
  total: number;
  draft: number;
  published: number;
  archived: number;
}

export function TemplateStats({
  total,
  draft,
  published,
  archived,
}: Props) {
  const cards = [
    {
      label: "Total",
      value: total,
    },
    {
      label: "Draft",
      value: draft,
    },
    {
      label: "Published",
      value: published,
    },
    {
      label: "Archived",
      value: archived,
    },
  ];

  return (
    <section
      aria-label="Template statistics"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border bg-background p-5 shadow-xs"
        >
          <p className="text-sm text-muted-foreground">
            {card.label}
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}
