import {z} from 'zod';

export const exampleInput = z.object({
    name:z.string()
})

export const projectInput = z.object({
    projectId: z.string(),
    name: z.string(),
})

// For endpoints that only require the project id
export const projectIdOnlyInput = z.object({
    projectId: z.string(),
})

export const inviteInput = z.object({
    projectId: z.string(),
    email: z.string().email(),
})

export const acceptInviteInput = z.object({
    inviteId: z.string(),
})

export const pageInput = z.object({
    pageId: z.string(),
    name: z.string().optional(),
    canvasJson:z.any()
})

export const assetInput = z.object({
    projectId: z.string(),
    fileName: z.string(),
    type: z.string(),
})