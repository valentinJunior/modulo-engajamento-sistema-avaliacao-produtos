import Link from "next/link";

/** Dono: feature Sign-In — botão "Entrar" ou avatar da conta (em <Suspense>). */
export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="font-heading text-lg font-semibold">
          Avaliação de Produtos
        </Link>
      </div>
    </header>
  );
}
