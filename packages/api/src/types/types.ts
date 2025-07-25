import {z} from 'zod';

export const exampleInput = z.object({
    name:z.string()
})

export const projectInput = z.object({
    projectId: z.string(),
    name: z.string(),
})

export const inviteInput = z.object({
    projectId: z.string(),
    email: z.string().email(),
})

export const acceptInviteInput = z.object({
    inviteId: z.string(),
})