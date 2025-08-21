import { TRPCError } from "@trpc/server"
import { router, publicProcedure } from "../trpc"
import { isAuthed } from "../middleware/isAuthed"
import { pageInput, projectIdOnlyInput, projectInput } from "../types/types"
export const pagesRouter = router({
    getPages: publicProcedure
              .use(isAuthed)
      .input(projectIdOnlyInput)
      .query(async ({ ctx, input }) => {
        const { projectId } = input
        // Ensure user is a member of this project
        const membership = await ctx.prisma.userProject.findUnique({
                    where: {
            userId_projectId: {
              userId: ctx.user.id,
                        projectId,
                    },
          },
        })
        if (!membership) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }

        return ctx.prisma.page.findMany({
          where: { projectId },
          orderBy: { createdAt: "asc" },
        })
      }),
    createPage: publicProcedure
      .use(isAuthed)
    .input(projectInput)
      .mutation(async ({ ctx, input }) => {
        const { projectId, name } = input
        const membership = await ctx.prisma.userProject.findUnique({
          where: {
            userId_projectId: {
              userId: ctx.user.id,
                projectId,
            },
          },
        })
        if (!membership) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }

        return ctx.prisma.page.create({
          data: {
            projectId,
            name,
            canvasJson: {},
          },
        })
      }),
    updateCanvasJson: publicProcedure
      .use(isAuthed)
    .input(pageInput)
      .mutation(async ({ ctx, input }) => {
        const { pageId, canvasJson } = input

        // Verify user is a member of the page's project
        const page = await ctx.prisma.page.findUnique({
          where: { id: pageId },
          select: { id: true, projectId: true },
        })
        if (!page) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
        const membership = await ctx.prisma.userProject.findUnique({
          where: {
            userId_projectId: {
              userId: ctx.user.id,
              projectId: page.projectId,
            },
          },
        })
        if (!membership) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }

        return ctx.prisma.page.update({
          where: { id: pageId },
          data: { canvasJson },
        })
      }),
      updatePage: publicProcedure
      .use(isAuthed)
      .input(pageInput)
      .mutation(async ({ctx,input})=>{
        const {pageId,name} = input
        const page = await ctx.prisma.page.findUnique({ where: { id: pageId } })
        if (!page) throw new TRPCError({ code: "NOT_FOUND" })
        const membership = await ctx.prisma.userProject.findUnique({
          where: { userId_projectId: { userId: ctx.user.id, projectId: page.projectId } },
        })

        if (!membership) throw new TRPCError({ code: "FORBIDDEN" })

        return ctx.prisma.page.update({
            where: { id: pageId },
            data: { name },
          })
      }),
      deletePage: publicProcedure
  .use(isAuthed)
  .input(pageInput.pick({ pageId: true })) // or make a new schema for just pageId
  .mutation(async ({ ctx, input }) => {
    const { pageId } = input
    const page = await ctx.prisma.page.findUnique({ where: { id: pageId } })
    if (!page) throw new TRPCError({ code: "NOT_FOUND" })

    const membership = await ctx.prisma.userProject.findUnique({
      where: { userId_projectId: { userId: ctx.user.id, projectId: page.projectId } },
    })
    if (!membership) throw new TRPCError({ code: "FORBIDDEN" })

    return ctx.prisma.page.delete({ where: { id: pageId } })
  }),

})