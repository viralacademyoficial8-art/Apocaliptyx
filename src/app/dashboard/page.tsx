'use client';

export const dynamic = 'force-dynamic';


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Redirect to /explorar - Dashboard and Explorar pages have been unified
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/explorar');
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        <span className="text-gray-400">Redirigiendo...</span>
      </div>
    </div>
  );
}
