import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const RATING = 4;

type ReviewerPreviewProps = {
  firstName: string;
  lastName: string;
};

/** Avaliação de exemplo assinada com o nome que a pessoa está digitando. */
export function ReviewerPreview({ firstName, lastName }: ReviewerPreviewProps) {
  const first = firstName.trim();
  const last = lastName.trim();
  const hasName = first.length > 0 || last.length > 0;

  const signature = hasName
    ? [first, last ? `${last.charAt(0).toUpperCase()}.` : ""]
        .filter(Boolean)
        .join(" ")
    : "Seu nome";

  const initials = hasName
    ? `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <figure className="w-full max-w-sm -rotate-1 rounded-2xl bg-card p-5 text-card-foreground shadow-[0_24px_48px_-24px_rgb(5_10_30/0.6)] sm:p-7 motion-safe:transition-transform motion-safe:duration-500 lg:max-w-md">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          Fone de ouvido sem fio
        </p>
        <div
          className="flex gap-0.5"
          role="img"
          aria-label={`${RATING} de 5 estrelas`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              // biome-ignore lint/suspicious/noArrayIndexKey: lista fixa
              key={i}
              aria-hidden
              className={cn(
                "size-4",
                i < RATING
                  ? "fill-rating text-rating"
                  : "fill-muted text-muted",
              )}
            />
          ))}
        </div>
      </div>

      <blockquote className="mt-4 hidden font-heading text-xl leading-snug text-pretty sm:block">
        A bateria durou a semana inteira e o encaixe não incomoda depois de
        horas de uso. Só queria um estojo menor.
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4 sm:mt-6">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-rating font-heading text-sm font-semibold text-ink"
        >
          {initials}
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate font-heading text-lg font-semibold",
              !hasName && "text-muted-foreground",
            )}
          >
            {signature}
          </span>
          <span className="block text-sm text-muted-foreground">
            Avaliou há poucos minutos
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
