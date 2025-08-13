import {router,publicProcedure} from "../trpc"
import { isAuthed } from "../middleware/isAuthed"

export const listProjectsRouter = router({
    listProjects: publicProcedure
      .use(isAuthed)
      .query(({ ctx }) =>
        ctx.prisma.project.findMany({
          where: {
            deletedAt: null,
            members: { some: { userId: ctx.user.id } },
          },
          orderBy: { createdAt: 'asc' },
          select: { id: true, name: true, createdAt: true },
        })
      ),
  });