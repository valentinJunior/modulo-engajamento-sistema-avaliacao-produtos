import { Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conta criada",
};

export default function SignUpSuccessPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
      <div className="w-full max-w-md">
        <span
          aria-hidden
          className="grid size-14 place-items-center rounded-full bg-ink text-rating"
        >
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <h1 className="mt-8 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Conta criada
        </h1>
        <p className="mt-3 max-w-[38ch] text-base text-muted-foreground">
          Sua conta está pronta. Em breve você poderá entrar e publicar suas
          primeiras avaliações.
        </p>
      </div>
    </main>
  );
}
