import Image from "next/image";
import { Stars } from "@/components/stars";
import { avatarUrl } from "@/lib/avatar";
import type { PublicFeedback } from "@/server/product-details";
import { RelativeTime } from "./relative-time";

/** Avaliações, mais recentes primeiro — o cartão prometido no cadastro. */
export function FeedbackList({ feedbacks }: { feedbacks: PublicFeedback[] }) {
  if (feedbacks.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-[#c5cddc] px-6 py-10 dark:border-border">
        <Stars value={0} starClassName="size-5" />
        <p className="mt-4 font-heading text-xl font-medium text-pretty">
          Ninguém avaliou este produto ainda.
        </p>
        <p className="mt-1 text-muted-foreground">
          A primeira avaliação ajuda quem vem depois a decidir.
        </p>
      </div>
    );
  }

  return (
    <ol className="mt-6 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[0_24px_48px_-32px_rgb(5_10_30/0.45)]">
      {feedbacks.map((feedback) => (
        <li
          key={feedback.id}
          className="border-b border-border last:border-b-0"
        >
          <figure className="p-5 sm:p-7">
            <Stars value={feedback.score} />
            <blockquote className="mt-3 font-heading text-lg leading-snug whitespace-pre-line text-pretty sm:text-xl">
              {feedback.comment}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <Image
                src={avatarUrl(feedback.author.accountId)}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="size-10 shrink-0 rounded-full bg-rating"
              />
              <span className="min-w-0">
                <span className="block truncate font-heading text-base font-semibold">
                  {feedback.author.signature}
                </span>
                <span className="block text-sm text-muted-foreground">
                  Avaliou <RelativeTime date={feedback.createdAt} />
                </span>
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ol>
  );
}
