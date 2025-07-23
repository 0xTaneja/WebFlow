import { mergeRouters } from "./trpc";
import { exampleRouter } from "./routers/example";
import { appRouter as whoAmIRouter } from "./routers/_app";
import { createProjectRouter } from "./routers/createProject";
import { listProjectsRouter } from "./routers/listProjects";
import { deleteProjectRouter } from "./routers/projectAction";
import { renameProjectRouter } from "./routers/projectAction";
export const appRouter = mergeRouters(exampleRouter, whoAmIRouter,createProjectRouter,listProjectsRouter,deleteProjectRouter,renameProjectRouter);

export type AppRouter = typeof appRouter;