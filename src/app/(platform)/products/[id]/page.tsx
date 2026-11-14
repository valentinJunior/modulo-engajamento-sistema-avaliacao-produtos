import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct, listFeedbacks } from "@/server/product-details";
import { FeedbackList } from "./feedback-list";
import { ProductHeader } from "./product-header";
import { ReviewBox, ReviewBoxSkeleton } from "./review-box";
import { ProductSkeleton } from "./skeletons";

export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product?.name ?? "Produto não encontrado" };
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:px-8 sm:pt-8 lg:pb-24">
      <Link
        href="/"
        className="-ml-1 inline-flex rounded-md px-1 py-0.5 text-sm font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Todos os produtos
      </Link>

      {/* params só é lido aqui dentro, para a casca da página ser reaproveitada */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductView params={params} />
      </Suspense>
    </div>
  );
}

async function ProductView({
  params,
}: Pick<PageProps<"/products/[id]">, "params">) {
  const { id } = await params;
  const [product, feedbacks] = await Promise.all([
    getProduct(id),
    listFeedbacks(id),
  ]);
  if (!product) notFound();

  return (
    <>
      <ProductHeader product={product} reviewCount={feedbacks.length} />

      <section
        aria-labelledby="reviews-title"
        className="mt-14 grid gap-10 border-t border-border pt-10 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14"
      >
        <div>
          <h2
            id="reviews-title"
            className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            O que as pessoas acharam
          </h2>
          <FeedbackList feedbacks={feedbacks} />
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          {/* Depende da sessão (cookies), então fica fora da parte pública */}
          <Suspense fallback={<ReviewBoxSkeleton />}>
            <ReviewBox productId={product.id} feedbacks={feedbacks} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
