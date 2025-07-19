import { isAuthed } from "../middleware/isAuthed"
import {router,publicProcedure} from "../trpc"

export const appRouter = router({
    whoAmI: publicProcedure
      .use(isAuthed) // auth guard adds ctx.user
      .query(({ ctx }) => ctx.user.id),
})