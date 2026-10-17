import type { SiteInfo } from './types';

/** The primary "strategy call" CTA: external booking page when configured, otherwise the contact form. */
export function callCta(site: SiteInfo) {
  return site.booking.enabled
    ? { href: site.booking.url, label: 'Book a Strategy Call', external: true }
    : { href: '/contact?intent=call', label: 'Request a Strategy Call', external: false };
}
