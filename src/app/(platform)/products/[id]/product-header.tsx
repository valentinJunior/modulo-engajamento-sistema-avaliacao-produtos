import { ArrowUpRight, ImageOff } from "lucide-react";
import Image from "next/image";
import { Stars } from "@/components/stars";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductDetails } from "@/server/product-details";

export function reviewCountLabel(count: number) {
  return count === 1 ? "1 avaliação" : `${count} avaliações`;
}

type ProductHeaderProps = {
  product: ProductDetails;
  reviewCount: number;
};

export function ProductHeader({ product, reviewCount }: ProductHeaderProps) {
  const hasScore = product.score !== null && reviewCount > 0;

  return (
    <header className="mt-4 grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:gap-12 lg:gap-16">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1152px) 600px, (min-width: 768px) 54vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff aria-hidden className="size-10" />
            <span className="sr-only">Produto sem imagem</span>
          </div>
        )}
      </div>

      <div>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {product.name}
        </h1>
        {product.description && (
          <p className="mt-4 max-w-[52ch] text-lg text-pretty text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="mt-8 flex items-center gap-4">
          {hasScore ? (
            <>
              <span className="font-heading text-6xl leading-none font-semibold tracking-tight tabular-nums">
                {(product.score as number).toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
              <span className="flex flex-col gap-1.5">
                <Stars value={product.score as number} starClassName="size-5" />
                <a
                  href="#reviews-title"
                  className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {reviewCountLabel(reviewCount)}
                </a>
              </span>
            </>
          ) : (
            <span className="flex flex-col gap-1.5">
              <Stars value={0} starClassName="size-5" />
              <span className="text-sm font-medium text-muted-foreground">
                Ainda sem avaliações
              </span>
            </span>
          )}
        </div>

        <a
          href={product.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 h-11 rounded-md px-5 text-base",
          )}
        >
          Ver na loja
          <ArrowUpRight aria-hidden data-icon="inline-end" />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>
    </header>
  );
}
