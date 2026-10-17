import type { ArticleDetail, LeadOptions, ServiceItem, SiteInfo, WorkDetail, WorkList } from './types';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export class NotFoundError extends Error {}

/** Server-side fetch to the NestJS API. Always fresh: content status and settings change from the admin. */
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api${path}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
  return (await res.json()) as T;
}

export const getSite = () => get<SiteInfo>('/site');
export const getServices = () => get<ServiceItem[]>('/services');
export const getHomeWork = () => get<WorkList>('/work?limit=4');
export const getWorkDetail = (slug: string) => get<WorkDetail>(`/work/${encodeURIComponent(slug)}`);
export const getArticleDetail = (slug: string) => get<ArticleDetail>(`/articles/${encodeURIComponent(slug)}`);

/** Site settings + services, or null when the API is unreachable. */
export async function getBootstrap(): Promise<{ site: SiteInfo; services: ServiceItem[] } | null> {
  try {
    const [site, services] = await Promise.all([getSite(), getServices()]);
    return { site, services };
  } catch {
    return null;
  }
}

/** Enquiry form options, or null if unavailable. */
export async function getLeadOptions(): Promise<LeadOptions | null> {
  try {
    return await get<LeadOptions>('/leads/options');
  } catch {
    return null;
  }
}
