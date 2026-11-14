/** Casca enquanto o produto carrega (mesma geometria do conteúdo real). */
export function ProductSkeleton() {
  return (
    <div className="motion-safe:[&_.bone]:animate-pulse">
      <output className="sr-only">Carregando produto…</output>
      <div
        aria-hidden
        className="mt-4 grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:gap-12 lg:gap-16"
      >
        <div className="bone aspect-[4/3] rounded-2xl bg-muted" />
        <div>
          <div className="bone h-11 w-4/5 rounded-lg bg-muted" />
          <div className="bone mt-5 h-5 w-full rounded bg-muted" />
          <div className="bone mt-2 h-5 w-2/3 rounded bg-muted" />
          <div className="bone mt-8 h-14 w-48 rounded-lg bg-muted" />
          <div className="bone mt-8 h-11 w-36 rounded-md bg-muted" />
        </div>
      </div>
      <div aria-hidden className="mt-14 border-t border-border pt-10 sm:mt-16">
        <div className="bone h-8 w-72 max-w-full rounded-lg bg-muted" />
        <div className="bone mt-6 h-64 rounded-2xl bg-muted lg:w-[calc(100%-27.5rem)]" />
      </div>
    </div>
  );
}
