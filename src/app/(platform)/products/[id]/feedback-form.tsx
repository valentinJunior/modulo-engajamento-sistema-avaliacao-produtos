"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { StarRatingInput } from "@/components/star-rating-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { avatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { COMMENT_MAX, createFeedbackSchema } from "@/lib/validations/feedback";
import { useTRPC } from "@/trpc/client";

const formSchema = createFeedbackSchema.omit({ productId: true });
type FormValues = z.input<typeof formSchema>;

const GENERAL_ERRORS: Record<string, string> = {
  UNAUTHORIZED: "Sua sessão expirou. Entre novamente para publicar.",
  NOT_FOUND: "Este produto não está mais disponível.",
  CONFLICT: "Você já avaliou este produto.",
  BAD_REQUEST: "Verifique a nota e o comentário e tente novamente.",
};

type FeedbackFormProps = {
  productId: string;
  author: { accountId: string; signature: string };
  alreadyReviewed: boolean;
};

export function FeedbackForm({
  productId,
  author,
  alreadyReviewed,
}: FeedbackFormProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [published, setPublished] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { score: undefined, comment: "" },
  });
  const comment = useWatch({ control: form.control, name: "comment" }) ?? "";

  const create = useMutation(
    trpc.feedbacks.create.mutationOptions({
      onSuccess: () => {
        setPublished(true);
        // Traz a avaliação nova para o topo da lista e a média atualizada
        router.refresh();
      },
      onError: (error) => {
        const fieldErrors = error.data?.fieldErrors;
        if (fieldErrors) {
          for (const name of ["score", "comment"] as const) {
            const message = fieldErrors[name]?.[0];
            if (message) form.setError(name, { message });
          }
        }
        const code = error.data?.code;
        setFormError(
          (code && GENERAL_ERRORS[code]) ||
            error.message ||
            "Não foi possível publicar a avaliação. Tente novamente.",
        );
      },
    }),
  );

  if (published || alreadyReviewed) {
    return (
      <output className="flex gap-3 rounded-2xl bg-card p-6 text-card-foreground sm:p-8">
        <CircleCheck
          aria-hidden
          className="mt-1 size-6 shrink-0 text-ink dark:text-rating"
        />
        <div>
          <p className="font-heading text-2xl font-semibold tracking-tight">
            {published
              ? "Avaliação publicada."
              : "Você já avaliou este produto."}
          </p>
          <p className="mt-1 text-muted-foreground">
            {published
              ? "Ela já aparece na lista, com a sua assinatura: "
              : "Sua avaliação está na lista, com a sua assinatura: "}
            <span className="font-medium text-foreground">
              {author.signature}
            </span>
          </p>
        </div>
      </output>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    create.mutate({
      productId,
      score: values.score,
      comment: values.comment,
    });
  });

  const { errors } = form.formState;
  const length = comment.trim().length;
  const overLimit = length > COMMENT_MAX;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="review-form-title"
      className="rounded-2xl bg-card p-6 text-card-foreground shadow-[0_24px_48px_-32px_rgb(5_10_30/0.45)] sm:p-8"
    >
      <h2
        id="review-form-title"
        className="font-heading text-2xl font-semibold tracking-tight"
      >
        Avalie este produto
      </h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Image
          src={avatarUrl(author.accountId)}
          alt=""
          width={24}
          height={24}
          unoptimized
          className="size-6 rounded-full bg-rating"
        />
        <span>
          Publicando como{" "}
          <span className="font-medium text-foreground">
            {author.signature}
          </span>
        </span>
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {formError && (
          <Alert
            variant="destructive"
            className="border-destructive/40 bg-destructive/5 px-3 py-2.5"
          >
            <CircleAlert />
            <AlertTitle>Não foi possível publicar</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!errors.score}>
          <span id="score-label" className="text-sm font-medium">
            Sua nota
          </span>
          <Controller
            control={form.control}
            name="score"
            render={({ field }) => (
              <StarRatingInput
                name="score"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                labelledBy="score-label"
                describedBy={errors.score ? "score-error" : undefined}
                invalid={!!errors.score}
                disabled={create.isPending}
              />
            )}
          />
          <FieldError id="score-error" errors={[errors.score]} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment" className="text-sm font-medium">
            Comentário
          </FieldLabel>
          <Textarea
            id="comment"
            rows={5}
            placeholder="Conte como foi usar o produto: o que funcionou e o que poderia ser melhor."
            aria-invalid={!!errors.comment}
            aria-describedby={cn(
              "comment-count",
              errors.comment && "comment-error",
            )}
            className="min-h-32 rounded-md bg-card px-3 py-2.5 shadow-[inset_0_1px_0_rgb(27_35_64/0.04)] md:text-base"
            disabled={create.isPending}
            {...form.register("comment")}
          />
          <div className="flex items-start justify-between gap-4">
            <FieldError id="comment-error" errors={[errors.comment]} />
            <span
              id="comment-count"
              className={cn(
                "ml-auto shrink-0 text-sm tabular-nums",
                overLimit
                  ? "font-medium text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {length}/{COMMENT_MAX}
              <span className="sr-only"> caracteres</span>
            </span>
          </div>
        </Field>

        <Button
          type="submit"
          className="h-11 w-full rounded-md text-base"
          disabled={create.isPending}
        >
          {create.isPending && <LoaderCircle className="animate-spin" />}
          {create.isPending ? "Publicando…" : "Publicar avaliação"}
        </Button>
      </div>
    </form>
  );
}
