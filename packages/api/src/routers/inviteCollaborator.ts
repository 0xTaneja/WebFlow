import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { isAuthed } from "../middleware/isAuthed";
import { inviteInput, acceptInviteInput } from "../types/types";
import { sendEmail } from "../utils/email";

export const inviteCollaboratorRouter = router({
  inviteCollaborator: publicProcedure
    .use(isAuthed)
    .input(inviteInput)
    .mutation(async ({ ctx, input }) => {
      const { projectId, email } = input;

      // Ensure requesting user is OWNER on the project
      const owner = await ctx.prisma.userProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.id,
            projectId,
          },
        },
      });

      if (!owner || owner.role !== "OWNER") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // If user already member, short-circuit
      const invitedUser = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (invitedUser) {
        // Check if already a member
        const exists = await ctx.prisma.userProject.findUnique({
          where: {
            userId_projectId: {
              userId: invitedUser.id,
              projectId,
            },
          },
        });
        if (exists) {
          return { status: "ALREADY_MEMBER" as const };
        }

        await ctx.prisma.userProject.create({
          data: {
            userId: invitedUser.id,
            projectId,
            role: "MEMBER",
          },
        });

        return { status: "MEMBER_ADDED" as const };
      }

      // Otherwise create / upsert invite and capture the created record
      const invite = await ctx.prisma.projectInvite.upsert({
        where: {
          projectId_email: {
            projectId,
            email,
          },
        },
        update: {},
        create: {
          projectId,
          email,
          invitedById: ctx.user.id,
          role: "MEMBER",
        },
      });

      // Fetch project name for nicer email copy (optional)
      const project = await ctx.prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true },
      });

      await sendEmail({
        to: email,
        subject: `${ctx.user.name ?? "Someone"} invited you to ${project?.name ?? "a project"}`,
        html: `
          <p>You’ve been invited to join the project <strong>${project?.name ?? "the project"}</strong>.</p>
          <p>Accept here: <a href="${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invite.id}">Accept invite</a></p>
        `,
       });

      return { status: "INVITE_SENT" as const };
    }),

  acceptInvite: publicProcedure
    .use(isAuthed)
    .input(acceptInviteInput)
    .mutation(async ({ ctx, input }) => {
      const { inviteId } = input;

      const invite = await ctx.prisma.projectInvite.findUnique({
        where: { id: inviteId },
      });

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
      }

      if (invite.email !== ctx.user.email) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const exists = await ctx.prisma.userProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.id,
            projectId: invite.projectId,
          },
        },
      });

      if (!exists) {
        await ctx.prisma.userProject.create({
          data: {
            userId: ctx.user.id,
            projectId: invite.projectId,
            role: invite.role,
          },
        });
      }

      await ctx.prisma.projectInvite.update({
        where: { id: inviteId },
        data: { accepted: true, acceptedAt: new Date() },
      });

      return { status: "INVITE_ACCEPTED" as const };
    }),
});