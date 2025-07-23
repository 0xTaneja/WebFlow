import { mergeRouters } from "./trpc";
import { exampleRouter } from "./routers/example";
import { appRouter as whoAmIRouter } from "./routers/_app";
import { createProjectRouter } from "./routers/createProject";
import { listProjectsRouter } from "./routers/listProjects";
export const appRouter = mergeRouters(exampleRouter, whoAmIRouter,createProjectRouter,listProjectsRouter);

export type AppRouter = typeof appRouter;