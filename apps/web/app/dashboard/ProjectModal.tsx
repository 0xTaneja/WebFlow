'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';

export default function ProjectModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const createProject = trpc.createProject.useMutation({
    onSuccess: () => {
      setName('');
      setOpen(false);
    },
  });

  const submit = async () => {
    if (!name.trim()) return;
    await createProject.mutateAsync({ name });
  };

  return (
    <div>
      <button
        className="px-3 py-2 bg-blue-600 text-white rounded"
        onClick={() => setOpen(true)}
      >
        New Project
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-80 space-y-4">
            <h2 className="text-lg font-semibold">Create Project</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-2 py-1 rounded"
              placeholder="Project name"
            />
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1" onClick={() => setOpen(false)}>Cancel</button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                disabled={createProject.isPending}
                onClick={submit}
              >
                {createProject.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
            {createProject.error && (
              <p className="text-red-600 text-sm">{createProject.error.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 