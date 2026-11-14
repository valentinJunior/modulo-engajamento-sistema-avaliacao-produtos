import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProductNotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 sm:py-24">
      <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance">
        Produto não encontrado
      </h1>
      <p className="mt-3 max-w-[48ch] text-lg text-muted-foreground">
        O link pode estar errado ou o produto foi removido do catálogo.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants(), "mt-8 h-11 rounded-md px-5 text-base")}
      >
        Ver todos os produtos
      </Link>
    </div>
  );
}
