import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { type Context, createContext } from "@/server/trpc";

function handler(req: Request) {
  let ctx: Context | undefined;

  return fetchRequestHandler({
    endpoint: "/api/v1",
    req,
    router: appRouter,
    createContext: () => {
      ctx = createContext();
      return ctx;
    },
    responseMeta({ errors }) {
      // Em caso de sucesso, usa o status definido pela procedure (ex.: 201)
      if (errors.length === 0 && ctx?.successStatus) {
        return { status: ctx.successStatus };
      }
      return {};
    },
  });
}

export { handler as GET, handler as POST };
