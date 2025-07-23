import {z} from 'zod';

export const exampleInput = z.object({
    name:z.string()
})

export const projectInput = z.object({
    projectId: z.string(),
    name: z.string(),
})