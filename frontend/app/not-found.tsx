import { SiteShell } from '@/components/layout/SiteShell';
import { SiteUnavailable } from '@/components/layout/SiteUnavailable';
import { NotFoundContent } from '@/components/pages/NotFoundContent';
import { getBootstrap } from '@/lib/server-api';

export const metadata = { title: 'Page not found' };

/** Unmatched URLs: render the 404 inside the public site chrome. */
export default async function RootNotFound() {
  const boot = await getBootstrap();
  if (!boot) return <SiteUnavailable />;
  return (
    <SiteShell site={boot.site} services={boot.services} notFound>
      <NotFoundContent />
    </SiteShell>
  );
}
