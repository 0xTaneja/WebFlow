'use client';

export default function SubscribeButton() {
  async function subscribe() {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <button
      className="px-4 py-2 bg-black text-white rounded"
      onClick={subscribe}
    >
      Subscribe
    </button>
  );
} 