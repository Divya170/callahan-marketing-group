import { SiteShell } from '@/components/layout/SiteShell';
import { SiteUnavailable } from '@/components/layout/SiteUnavailable';
import { getBootstrap } from '@/lib/server-api';

// Content status and settings are edited live in the admin, so always render fresh.
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const boot = await getBootstrap();
  if (!boot) return <SiteUnavailable />;
  return (
    <SiteShell site={boot.site} services={boot.services}>
      {children}
    </SiteShell>
  );
}
