import type { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col">
      <SignUpForm
        intro={
          <header className="mb-8">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Crie sua conta
            </h1>
            <p className="mt-3 max-w-[38ch] text-base text-muted-foreground">
              Avalie os produtos que você usa e ajude outras pessoas a escolher
              melhor.
            </p>
          </header>
        }
      />
    </main>
  );
}
