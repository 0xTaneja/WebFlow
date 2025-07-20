import {inferAsyncReturnType} from "@trpc/server";
import { PrismaClient } from "@prisma/client";
export interface Session {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  expiresAt?: Date | string | number;
}
const prisma = new PrismaClient();
export function createContext({ session }: { session: Session | null }) {
  return { session,prisma };
}

export type Context = inferAsyncReturnType<typeof createContext>

