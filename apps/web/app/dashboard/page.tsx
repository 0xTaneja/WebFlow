'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useStore } from '@nanostores/react';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = useStore(authClient.useSession);

  if (isPending) return <p className="p-4">Loading…</p>;

  if (!session) {
    // not signed in – redirect to /sign-in
    router.replace('/sign-in');
    return null;
  }

    return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Welcome, {session.user.name ?? session.user.email}</h1>
      <p>This is your private dashboard ✨</p>
    </div>
  );
}