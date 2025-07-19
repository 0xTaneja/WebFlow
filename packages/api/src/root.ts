import { mergeRouters } from "./trpc";
import { exampleRouter } from "./routers/example";
import { appRouter as whoAmIRouter } from "./routers/_app";

export const appRouter = mergeRouters(exampleRouter, whoAmIRouter);

export type AppRouter = typeof appRouter;