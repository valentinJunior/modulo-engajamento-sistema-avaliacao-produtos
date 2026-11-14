import Link from "next/link";
import { connection } from "next/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentAccount } from "@/server/auth";
import type { PublicFeedback } from "@/server/product-details";
import { FeedbackForm } from "./feedback-form";

type ReviewBoxProps = {
  productId: string;
  feedbacks: PublicFeedback[];
};

/** Formulário (com sessão) ou convite para entrar. Lê cookies: use em <Suspense>. */
export async function ReviewBox({ productId, feedbacks }: ReviewBoxProps) {
  // A verificação do JWT lê a hora atual (exp); só pode rodar na requisição
  await connection();
  const account = await getCurrentAccount();

  if (!account) return <SignInPrompt productId={productId} />;

  const lastInitial = account.lastName.trim().charAt(0).toUpperCase();
  return (
    <FeedbackForm
      productId={productId}
      author={{
        accountId: account.id,
        signature: lastInitial
          ? `${account.firstName.trim()} ${lastInitial}.`
          : account.firstName.trim(),
      }}
      alreadyReviewed={feedbacks.some(
        (feedback) => feedback.author.accountId === account.id,
      )}
    />
  );
}

function SignInPrompt({ productId }: { productId: string }) {
  const next = encodeURIComponent(`/products/${productId}`);
  return (
    <div className="rounded-2xl bg-ink p-6 text-ink-foreground sm:p-8">
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
        Entre para avaliar este produto.
      </h2>
      <p className="mt-2 text-ink-foreground/75">
        Sua avaliação aparece aqui, assinada com seu nome.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/auth/sign-in?next=${next}`}
          className={cn(
            buttonVariants(),
            "h-11 rounded-md bg-rating px-5 text-base text-ink hover:bg-rating/85 focus-visible:ring-rating/60",
          )}
        >
          Entrar
        </Link>
        <Link
          href="/auth/sign-up"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-11 rounded-md border-ink-foreground/25 px-5 text-base text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground focus-visible:ring-ink-foreground/40",
          )}
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}

export function ReviewBoxSkeleton() {
  return (
    <div
      aria-hidden
      className="h-56 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none"
    />
  );
}
