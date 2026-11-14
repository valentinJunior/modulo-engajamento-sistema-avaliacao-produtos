import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProductCardSkeleton } from "@/components/product-card";
import { getFirstProductsPage } from "@/server/product-list";
import { ProductGrid } from "./product-grid";

/** Dona: feature Home — listagem pública de produtos com rolagem infinita. */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-20 sm:px-8 sm:pt-14">
      <header className="mb-10 sm:mb-12">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Produtos
        </h1>
        <p className="mt-3 max-w-[42ch] text-base text-muted-foreground">
          Veja o que as pessoas acham antes de comprar.
        </p>
      </header>

      <Suspense fallback={<GridFallback />}>
        <ProductFeed />
      </Suspense>
    </div>
  );
}

/**
 * Primeira página renderizada no servidor e cacheada por alguns minutos.
 * `connection()` adia a busca para o momento da requisição: o build não
 * depende do banco e uma falha vira o estado de erro no navegador (que
 * tenta de novo), em vez de quebrar o prerender.
 */
async function ProductFeed() {
  await connection();
  let initialPage = null;
  try {
    initialPage = await getFirstProductsPage();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[home] falha ao carregar a primeira página", error);
  }
  return <ProductGrid initialPage={initialPage} />;
}

function GridFallback() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <span className="sr-only">Carregando produtos…</span>
      {Array.from({ length: 6 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: esqueletos estáticos
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
