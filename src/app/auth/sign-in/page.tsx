import type { Metadata } from "next";
import Link from "next/link";
import { ReviewStack } from "./review-stack";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function SignInPage() {
  return (
    <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="flex justify-center px-4 py-10 sm:px-8 sm:py-14 lg:items-center lg:py-16">
        <div className="w-full max-w-md">
          <header className="mb-8">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Entre na sua conta
            </h1>
            <p className="mt-3 max-w-[38ch] text-base text-muted-foreground">
              Continue de onde parou: veja o que mudou nos produtos que você
              acompanha.
            </p>
          </header>

          <SignInForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link
              href="/auth/sign-up"
              className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </section>

      <aside
        aria-label="Avaliações recentes de exemplo"
        className="order-first flex flex-col items-center justify-center gap-5 bg-ink px-4 py-8 text-ink-foreground sm:px-8 lg:order-none lg:gap-16 lg:py-16"
      >
        <p className="max-w-sm text-center text-sm text-ink-foreground/75 lg:max-w-md lg:text-base">
          Novas avaliações chegaram enquanto você esteve fora.
        </p>
        <ReviewStack />
      </aside>
    </main>
  );
}
