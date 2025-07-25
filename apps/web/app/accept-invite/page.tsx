'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const acceptMutation = trpc.acceptInvite.useMutation();

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      return;
    }

    acceptMutation
      .mutateAsync({ inviteId: token })
      .then(() => router.replace('/dashboard'))
      .catch((err) => {
        console.error(err);
        setError(
          err?.message ?? 'Something went wrong while accepting the invite.'
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-600 text-center max-w-md">{error}</p>
        <Button onClick={() => router.replace('/')}>Go home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="animate-spin" />
      <p className="text-muted-foreground">Accepting invite…</p>
    </div>
  );
} 