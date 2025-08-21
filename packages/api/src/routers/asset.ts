import z from "zod";
import { protectedProcedure, router } from "../trpc";
import { assetInput } from "../types/types";

// AWS SDK (R2 is S3-compatible)
import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {createPresignedPost} from '@aws-sdk/s3-presigned-post'

// Single S3 client instance pointing to Cloudflare R2 endpoint
const s3 = new S3Client({
  region: "auto", // R2 ignores region but it is required by client
  endpoint: process.env.R2_PUBLIC_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const assetRouter = router({
   getUploadUrl: protectedProcedure
   .input(assetInput)
   .mutation(async ({ctx,input})=>{
    const key = `${input.projectId}/${Date.now()}_${input.fileName}`;
    const presigned = await createPresignedPost(s3, {
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Conditions : [['starts-with','$Content-Type',input.type]],
        Expires: 300,
    });
    return { presigned, key };
   }),

   confirmUpload: protectedProcedure
   .input(z.object({ projectId: z.string(), key: z.string(), width: z.number().optional(), height: z.number().optional(), type: z.string() }))
   .mutation(async ({ input, ctx }) => {
     const url = `${process.env.R2_PUBLIC_URL}/${input.key}`;
     return ctx.prisma.asset.create({
       data: {
         key: input.key,
         url,
         width: input.width ?? null,
         height: input.height ?? null,
         contentType: input.type,
         project: { connect: { id: input.projectId } },
       },
     });
   }),

   list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input, ctx }) => ctx.prisma.asset.findMany({ where: { project: { id: input.projectId } }, orderBy: { createdAt: 'desc' } })),

   delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const asset = await ctx.prisma.asset.delete({ where: { id: input.id } });
      const key = asset.url.replace(`${process.env.R2_PUBLIC_URL}/`, "");
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      }));
      return asset;
    })
})