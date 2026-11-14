import "server-only";
import { router } from "@/server/trpc";
import { authRouter } from "./auth";
import { feedbacksRouter } from "./feedbacks";
import { productsRouter } from "./products";

export const appRouter = router({
  auth: authRouter,
  products: productsRouter,
  feedbacks: feedbacksRouter,
});

export type AppRouter = typeof appRouter;
