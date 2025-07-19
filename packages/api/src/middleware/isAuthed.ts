import {TRPCError} from '@trpc/server';
import { middleware } from '../trpc';

export const isAuthed = middleware(async({ctx,next})=>{
    if(!ctx.session?.user){
        throw new TRPCError({code:'UNAUTHORIZED'});
    }
    return next({ctx:{user:ctx.session.user}});
})
