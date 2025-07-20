import {z} from "zod"
import {router,publicProcedure} from "../trpc"




export const createProjectRouter = router({
    createProject:publicProcedure.input(z.object({
        name:z.string(),
    })).mutation(async({input,ctx})=>{
       const name = input.name;
       const project = await ctx.prisma.project.create({
         data:{
            name,
            members:{create:{
                userId:ctx.session.user.id,
                role:'OWNER'
            }}
         },
        
       })
       return project;
    })
})