"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SCORES = [1, 2, 3, 4, 5] as const;

const HINTS: Record<number, string> = {
  1: "Muito ruim",
  2: "Ruim",
  3: "Razoável",
  4: "Bom",
  5: "Excelente",
};

type StarRatingInputProps = {
  name: string;
  value: number | undefined;
  onChange: (value: number) => void;
  onBlur?: () => void;
  /** id do elemento que rotula o grupo (ex.: o <legend> ou um título). */
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
};

/**
 * Seletor de nota de 1 a 5. Usa rádios nativos (escondidos visualmente),
 * então as setas do teclado mudam a nota e leitores de tela anunciam
 * "1 estrela" … "5 estrelas".
 */
export function StarRatingInput({
  name,
  value,
  onChange,
  onBlur,
  labelledBy,
  describedBy,
  invalid,
  disabled,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-required
        className="-ml-1.5 flex"
        onPointerLeave={() => setHovered(null)}
      >
        {SCORES.map((score) => {
          const filled = score <= shown;
          const id = `${name}-${score}`;
          return (
            <label
              key={score}
              htmlFor={id}
              onPointerEnter={() => !disabled && setHovered(score)}
              className={cn(
                "group/star relative grid size-11 cursor-pointer place-items-center rounded-lg transition-colors",
                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:outline-none",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
                onBlur={onBlur}
                disabled={disabled}
                className="peer sr-only"
              />
              <span className="sr-only">
                {score === 1 ? "1 estrela" : `${score} estrelas`}
              </span>
              <Star
                aria-hidden
                strokeWidth={1.75}
                className={cn(
                  "size-8 transition-[color,fill,transform] duration-150 motion-safe:group-active/star:scale-90",
                  filled
                    ? "fill-rating text-rating"
                    : cn(
                        "fill-transparent",
                        invalid ? "text-destructive/60" : "text-[#9aa6c0]",
                      ),
                )}
              />
            </label>
          );
        })}
      </div>
      <span
        aria-hidden
        className={cn(
          "min-w-[9ch] font-heading text-base font-medium",
          shown ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {shown ? HINTS[shown] : "Sem nota"}
      </span>
    </div>
  );
}
