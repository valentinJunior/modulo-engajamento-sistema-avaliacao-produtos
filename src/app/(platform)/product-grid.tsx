"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  ProductCard,
  type ProductCardData,
  ProductCardSkeleton,
} from "@/components/product-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

const PAGE_SIZE = 12;
const GRID =
  "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

type ProductPage = { items: ProductCardData[]; nextCursor: string | null };

/**
 * Lista de produtos com rolagem infinita. A primeira página vem do servidor
 * (`initialPage`); as seguintes são buscadas quando o sentinela aparece.
 * Sem `initialPage` (falha no servidor), busca tudo no navegador.
 */
export function ProductGrid({
  initialPage,
}: {
  initialPage: ProductPage | null;
}) {
  const trpc = useTRPC();
  const query = useInfiniteQuery(
    trpc.products.list.infiniteQueryOptions(
      { limit: PAGE_SIZE },
      {
        getNextPageParam: (last) => last.nextCursor,
        ...(initialPage && {
          initialData: { pages: [initialPage], pageParams: [null] },
        }),
      },
    ),
  );
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isPending,
    isRefetching,
    refetch,
  } = query;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const canLoadMore = hasNextPage && !isFetchingNextPage && !error;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchNextPage();
      },
      // Começa a buscar antes de o fim da lista ficar visível
      { rootMargin: "0px 0px 600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, fetchNextPage]);

  if (isPending) {
    return (
      <div className={GRID} aria-busy="true">
        <span className="sr-only">Carregando produtos…</span>
        {Array.from({ length: 6 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: esqueletos estáticos
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) {
    return <LoadError onRetry={() => refetch()} retrying={isRefetching} />;
  }

  const products = data.pages.flatMap((page) => page.items);

  if (products.length === 0) {
    return (
      <div className="max-w-md border-l-2 border-rating py-1 pl-4">
        <p className="font-heading text-xl font-semibold">
          Nenhum produto cadastrado ainda.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Assim que um produto for cadastrado, ele aparece aqui.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className={GRID}>
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 3 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: esqueletos estáticos
            <li key={`skeleton-${i}`}>
              <ProductCardSkeleton />
            </li>
          ))}
      </ul>

      <div ref={sentinelRef} aria-hidden className="h-px" />

      <div aria-live="polite" className="mt-12">
        {isFetchingNextPage && (
          <span className="sr-only">Carregando mais produtos…</span>
        )}
        {isFetchNextPageError && (
          <LoadError
            onRetry={() => fetchNextPage()}
            retrying={isFetchingNextPage}
          />
        )}
        {!hasNextPage && !error && (
          <p className="border-t border-border pt-5 text-sm text-muted-foreground">
            Você viu todos os produtos.
          </p>
        )}
      </div>
    </div>
  );
}

function LoadError({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <Alert
      variant="destructive"
      className="max-w-lg border-destructive/30 bg-destructive/5"
    >
      <CircleAlert />
      <AlertTitle>Não foi possível carregar os produtos.</AlertTitle>
      <AlertDescription>
        <p>Pode ser uma falha momentânea. Tente de novo em instantes.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? "Tentando…" : "Tentar de novo"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
