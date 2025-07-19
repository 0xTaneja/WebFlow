import { publicProcedure,router } from "../trpc";
import { exampleInput } from "../types/types";

export const exampleRouter = router({
    hello: publicProcedure.input(exampleInput)
    .query(({input})=>{
        return {greeting:`Hello ${input.name}`}
    })

})