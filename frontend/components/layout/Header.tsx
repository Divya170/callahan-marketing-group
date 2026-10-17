'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { callCta, useSite } from '@/lib/site-context';
import { CtaLink } from '@/components/ui/CtaLink';

const NAV = [
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
];
const MOBILE = [...NAV, { label: 'Contact', href: '/contact' }];

/** Pages whose hero is cream, so the header blends in until the page scrolls. */
const CREAM_TOP = ['/', '/services', '/work', '/contact'];

export function Header({ notFound = false }: { notFound?: boolean }) {
  const pathname = usePathname() || '/';
  const { site } = useSite();
  const cta = callCta(site);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(76);
  const restoreFocus = useRef(false);

  const section = '/' + (pathname.split('/')[1] || '');
  const close = useCallback((restore: boolean) => {
    restoreFocus.current = restore;
    setOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      if (restoreFocus.current) {
        restoreFocus.current = false;
        burgerRef.current?.focus();
      }
      return;
    }
    const t = setTimeout(() => menuRef.current?.querySelector('a')?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
      // Keep keyboard focus inside the open menu.
      if (e.key === 'Tab' && menuRef.current) {
        const items = [burgerRef.current, ...Array.from(menuRef.current.querySelectorAll<HTMLElement>('a'))].filter(Boolean) as HTMLElement[];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => window.innerWidth > 860 && setOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const topBg = notFound || CREAM_TOP.includes(pathname) ? 'var(--cream)' : 'var(--white)';

  return (
    <>
      <header ref={headerRef} className={`site-header${scrolled || open ? ' is-scrolled' : ''}`} style={{ background: topBg }}>
        <div className="wrap site-header__bar">
          <Link href="/" aria-label="Callahan Marketing Group — home" className="brand">
            <span aria-hidden="true" className="brand__mark" />
            <span className="brand__text">
              <span className="brand__name">Callahan</span>
              <span className="brand__sub">Marketing Group</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="main-nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="main-nav__link" aria-current={section === n.href ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
            <CtaLink cta={cta} className="btn btn--coral nav-cta" />
          </nav>

          <button
            ref={burgerRef}
            type="button"
            className="burger"
            onClick={() => {
              if (open) return close(true);
              // Place the menu directly under the header (the preview banner can push it down).
              setMenuTop(Math.max(0, headerRef.current?.getBoundingClientRect().bottom ?? 76));
              setOpen(true);
            }}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '✕' : '≡'}
          </button>
        </div>
      </header>

      {open && (
        <div id="mobile-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label="Site menu" className="mobile-menu" style={{ top: menuTop }}>
          {MOBILE.map((n, i) => (
            <Link key={n.href} href={n.href} className="mobile-menu__link" aria-current={section === n.href ? 'page' : undefined} onClick={() => close(false)}>
              {n.label}
              <span className="mobile-menu__num">0{i + 1}</span>
            </Link>
          ))}
          <CtaLink cta={cta} className="btn btn--coral mobile-menu__cta" onClick={() => close(false)} />
          <div className="mobile-menu__contact">
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            <a href={site.contact.phoneHref}>{site.contact.phone}</a>
          </div>
        </div>
      )}
    </>
  );
}
