import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SubscribeButton from './SubscribeButton';
import { headers } from 'next/headers';
import ProjectModal from './ProjectModal';

export default async function Dashboard() {
  const session = await auth.api.getSession({headers: await headers()});

  if (!session?.user) {
    redirect('/sign-in');
  }

    return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Welcome, {session.user.name ?? session.user.email}</h1>
      <p className="mb-4">This is your private dashboard ✨</p>
      <SubscribeButton />
      <ProjectModal />
    </div>
  );
}