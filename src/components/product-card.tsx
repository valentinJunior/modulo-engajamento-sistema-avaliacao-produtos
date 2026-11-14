import Image from "next/image";
import Link from "next/link";
import { Stars } from "@/components/stars";
import { Skeleton } from "@/components/ui/skeleton";

export type ProductCardData = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  score: number | null;
};

// Hosts liberados em next.config.ts (images.remotePatterns). Imagens de
// outros domínios (cadastradas via API) são exibidas sem otimização.
const OPTIMIZED_HOSTS = new Set(["picsum.photos", "fastly.picsum.photos"]);

function canOptimize(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && OPTIMIZED_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

const SIZES =
  "(min-width: 1280px) 270px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw";

/** Cartão "prateleira": imagem 4:3 e texto solto abaixo, sem caixa nem sombra. */
export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const { id, name, description, imageUrl, score } = product;

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes={SIZES}
            preload={priority}
            unoptimized={!canOptimize(imageUrl)}
            className="object-cover transition-[filter] duration-200 group-hover:brightness-95"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-end bg-ink p-5 font-heading text-7xl leading-none font-semibold text-rating"
          >
            {name.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <h2 className="mt-3.5 font-heading text-lg leading-snug font-semibold text-pretty">
        <Link
          href={`/products/${id}`}
          className="rounded-sm underline-offset-4 outline-none after:absolute after:inset-0 after:rounded-xl group-hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {name}
        </Link>
      </h2>

      {score !== null && (
        <div className="mt-1 flex items-center gap-1.5">
          <Stars value={score} starClassName="size-3.5" />
          <span className="text-sm font-medium tabular-nums">
            {score.toLocaleString("pt-BR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </span>
        </div>
      )}

      {description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col">
      <Skeleton className="aspect-4/3 rounded-xl" />
      <Skeleton className="mt-3.5 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1.5 h-4 w-2/3" />
    </div>
  );
}
