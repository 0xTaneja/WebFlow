import { mergeRouters } from "./trpc";
import { exampleRouter } from "./routers/example";
import { appRouter as whoAmIRouter } from "./routers/_app";
import { createProjectRouter } from "./routers/createProject";
import { listProjectsRouter } from "./routers/listProjects";
import { deleteProjectRouter } from "./routers/projectAction";
import { renameProjectRouter } from "./routers/projectAction";
import { inviteCollaboratorRouter } from "./routers/inviteCollaborator";
import { pagesRouter } from "./routers/pages";
import { assetRouter } from "./routers/asset";
export const appRouter = mergeRouters(exampleRouter, whoAmIRouter,createProjectRouter,listProjectsRouter,deleteProjectRouter,renameProjectRouter,inviteCollaboratorRouter,pagesRouter,assetRouter);

export type AppRouter = typeof appRouter;