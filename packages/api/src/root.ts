import { mergeRouters } from "./trpc";
import { exampleRouter } from "./routers/example";
import { appRouter as whoAmIRouter } from "./routers/_app";
import { createProjectRouter } from "./routers/createProject";

export const appRouter = mergeRouters(exampleRouter, whoAmIRouter,createProjectRouter);

export type AppRouter = typeof appRouter;