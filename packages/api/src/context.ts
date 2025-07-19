import {inferAsyncReturnType} from "@trpc/server";

export interface Session {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  expiresAt?: Date | string | number;
}

export function createContext({ session }: { session: Session | null }) {
  return { session };
}

export type Context = inferAsyncReturnType<typeof createContext>

