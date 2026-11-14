import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarsProps = {
  /** Nota de 0 a 5 (aceita meia estrela: 3.5 arredonda para 4 cheias). */
  value: number;
  className?: string;
  starClassName?: string;
};

/** Nota em estrelas, apenas leitura. Para escolher a nota, use um input próprio. */
export function Stars({ value, className, starClassName }: StarsProps) {
  const filled = Math.round(value);
  return (
    <span
      role="img"
      aria-label={`Nota ${value.toLocaleString("pt-BR")} de 5`}
      className={cn("inline-flex gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn(
            "size-4",
            n <= filled ? "fill-rating text-rating" : "fill-muted text-muted",
            starClassName,
          )}
        />
      ))}
    </span>
  );
}
