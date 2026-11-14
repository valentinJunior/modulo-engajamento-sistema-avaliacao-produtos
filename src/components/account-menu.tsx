import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { avatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import type { Account } from "@/server/auth";

type AccountMenuProps = {
  account: Pick<Account, "id" | "firstName" | "lastName" | "email">;
};

/**
 * Conta da sessão no cabeçalho. Em telas médias ou maiores mostra avatar,
 * nome e email; em telas pequenas só o avatar, com os dados num popover.
 */
export function AccountMenu({ account }: AccountMenuProps) {
  const fullName = `${account.firstName} ${account.lastName}`.trim();

  return (
    <>
      <div className="hidden items-center gap-3 sm:flex">
        <span className="min-w-0 text-right leading-tight">
          <span className="block max-w-56 truncate text-sm font-semibold">
            {fullName}
          </span>
          <span className="block max-w-56 truncate text-xs text-muted-foreground">
            {account.email}
          </span>
        </span>
        <Avatar accountId={account.id} />
      </div>

      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger
            aria-label={`Conta de ${fullName}`}
            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Avatar accountId={account.id} />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="flex w-64 items-center gap-3 p-3"
          >
            <Avatar accountId={account.id} className="size-10" />
            <div className="min-w-0 leading-tight">
              <PopoverTitle className="truncate font-semibold">
                {fullName}
              </PopoverTitle>
              <PopoverDescription className="truncate text-xs">
                {account.email}
              </PopoverDescription>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}

function Avatar({
  accountId,
  className,
}: {
  accountId: string;
  className?: string;
}) {
  return (
    <Image
      src={avatarUrl(accountId)}
      alt=""
      width={40}
      height={40}
      // SVG do DiceBear: não passa pelo otimizador de imagens
      unoptimized
      className={cn(
        "size-9 shrink-0 rounded-full bg-rating ring-2 ring-background",
        className,
      )}
    />
  );
}
