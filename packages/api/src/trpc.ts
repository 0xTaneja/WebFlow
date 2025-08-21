import { initTRPC } from "@trpc/server";
import superjson from 'superjson';
import { Context } from "./context";
import { isAuthed } from "./middleware/isAuthed";


const t = initTRPC.context<Context>().create({
   transformer: superjson,
   errorFormatter: ({shape})=>{
    return shape;
   },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
export const protectedProcedure = t.procedure.use(isAuthed)

