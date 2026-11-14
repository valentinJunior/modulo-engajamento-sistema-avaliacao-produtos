import { SiteHeader } from "@/components/site-header";

/** Layout base da plataforma (tudo fora de /auth). */
export default function PlatformLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
