import { Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/account-menu";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentAccount } from "@/server/auth";

/** Cabeçalho da plataforma: marca à esquerda, conta (ou "Entrar") à direita. */
export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          className="-mx-1 flex items-center gap-2 rounded-md px-1 font-heading text-lg font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-md bg-ink text-rating"
          >
            <Star className="size-4 fill-current" />
          </span>
          Avaliação de Produtos
        </Link>

        <Suspense fallback={<AccountSkeleton />}>
          <AccountArea />
        </Suspense>
      </div>
    </header>
  );
}

async function AccountArea() {
  const account = await getCurrentAccount();

  if (!account) {
    return (
      <Link
        href="/auth/sign-in"
        className={buttonVariants({
          className: "h-9 rounded-md px-4 text-sm",
        })}
      >
        Entrar
      </Link>
    );
  }

  return <AccountMenu account={account} />;
}

function AccountSkeleton() {
  return (
    <span aria-hidden className="size-9 animate-pulse rounded-full bg-muted" />
  );
}
