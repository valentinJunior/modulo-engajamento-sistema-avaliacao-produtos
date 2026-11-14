import type { ComponentProps } from "react";
import { Stars } from "@/components/stars";
import { cn } from "@/lib/utils";

type SampleReview = {
  product: string;
  rating: number;
  quote: string;
  author: string;
  initials: string;
  when: string;
};

const reviews: SampleReview[] = [
  {
    product: "Cafeteira italiana 6 xícaras",
    rating: 5,
    quote:
      "Faz um café encorpado em cinco minutos e a alça não esquenta. Já é a terceira que compro para presentear.",
    author: "Renata A.",
    initials: "RA",
    when: "Avaliou ontem",
  },
  {
    product: "Mochila para notebook 15”",
    rating: 4,
    quote:
      "Cabe tudo e não pesa nos ombros. O zíper lateral poderia ser maior.",
    author: "Diego M.",
    initials: "DM",
    when: "Avaliou há 3 dias",
  },
  {
    product: "Luminária de mesa articulada",
    rating: 3,
    quote: "Boa luz para leitura, mas a base balança um pouco.",
    author: "Paula T.",
    initials: "PT",
    when: "Avaliou na semana passada",
  },
];

/**
 * Pilha de avaliações de exemplo para o painel do login. A da frente aparece
 * completa; as de trás ficam deslocadas, como cartões empilhados.
 */
export function ReviewStack() {
  const [front, ...behind] = reviews;

  return (
    <div className="relative w-full max-w-sm -rotate-1 lg:mt-26 lg:max-w-md">
      {behind.map((review, index) => (
        <ReviewCard
          key={review.product}
          review={review}
          aria-hidden
          // Só o topo (produto + nota) aparece acima do cartão da frente
          className={cn(
            "absolute inset-0 hidden origin-top overflow-hidden lg:block",
            index === 0 && "z-10 -translate-y-13 scale-95 bg-[#dfe4ed]",
            index === 1 && "z-0 -translate-y-26 scale-90 bg-[#c3cbda]",
          )}
        />
      ))}
      <ReviewCard review={front} className="relative z-20" />
    </div>
  );
}

function ReviewCard({
  review,
  className,
  ...props
}: {
  review: SampleReview;
  className?: string;
} & ComponentProps<"figure">) {
  return (
    <figure
      className={cn(
        "rounded-2xl bg-card p-5 text-card-foreground shadow-[0_24px_48px_-24px_rgb(5_10_30/0.6)] sm:p-7",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="truncate text-sm font-medium text-muted-foreground">
          {review.product}
        </p>
        <Stars value={review.rating} />
      </div>

      <blockquote className="mt-4 hidden font-heading text-xl leading-snug text-pretty sm:block">
        {review.quote}
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4 sm:mt-6">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-rating font-heading text-sm font-semibold text-ink"
        >
          {review.initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-heading text-lg font-semibold">
            {review.author}
          </span>
          <span className="block text-sm text-muted-foreground">
            {review.when}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
