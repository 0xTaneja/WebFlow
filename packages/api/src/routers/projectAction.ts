import z from "zod"
import { isAuthed } from "../middleware/isAuthed"
import { router, publicProcedure} from "../trpc"
import { projectInput } from "../types/types"

export const renameProject = router({
    renameProject: publicProcedure.use(isAuthed).input(projectInput).mutation(({ctx,input})=>{
        const {projectId,name} = input;
        ctx.prisma.project.update({
            where:{
             id:projectId,
             members:{
                some:{
                    userId:ctx.user.id,
                }
             }
            },
            data:{
               name,
            }
        })
    })
})