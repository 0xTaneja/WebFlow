import z from "zod"
import { isAuthed } from "../middleware/isAuthed"
import { router, publicProcedure} from "../trpc"
import { projectInput } from "../types/types"

export const renameProjectRouter = router({
    renameProject: publicProcedure
    .use(isAuthed)
    .input(projectInput)
    .mutation(async ({ ctx, input }) => {
      const { projectId, name } = input
      // Only the unique ID is required here; the auth middleware already ensures `ctx.user` is set.
      return ctx.prisma.project.update({
        where: { id: projectId },
        data: { name },
      })
    }),
})

export const deleteProjectRouter = router({
    deleteProject: publicProcedure
    .use(isAuthed)
    .input(projectInput.pick({ projectId: true }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input
      return ctx.prisma.project.update({
        where: { id: projectId },
        data: { deletedAt: new Date() },
      })
    }),
})
