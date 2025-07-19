import {fetchRequestHandler} from '@trpc/server/adapters/fetch';
import {appRouter} from '@repo/api';
import { createContext } from '@repo/api';
import { auth } from '@/lib/auth';

// Prisma (and therefore Better-Auth) requires the full Node.js runtime.
// Removing the `edge` hint lets Next.js run this route in the default
// node environment.
export const runtime = 'nodejs';

const handler = (req:Request)=>{
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: async () => {
          const session = await auth.api.getSession({ headers: req.headers });
          return createContext({ session });
        },
    });
};

export {handler as GET,handler as POST}
