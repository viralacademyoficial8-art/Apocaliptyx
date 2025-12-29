'use client';

import { usePathname } from 'next/navigation';
import { Footer, FooterCompact } from '@/components/Footer';

export function FooterRouterClient() {
  const pathname = usePathname();

  if (pathname === '/') return <Footer />;

  return <FooterCompact />;
}
