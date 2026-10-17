'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/** "Skip to content" link. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.focus();
      }}
    >
      Skip to content
    </a>
  );
}

/** Floating "back to top" button shown after scrolling far down. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 1200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button type="button" className="to-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      ↑
    </button>
  );
}

/**
 * Fades elements marked with data-reveal="<delay ms>" in as they enter the viewport.
 * Watches the DOM so content that loads later (API data) is handled too.
 * Also moves focus to <main> after client-side navigation, for screen-reader users.
 */
export function RevealAndFocus() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).setAttribute('data-rv', 'done');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -6% 0px' },
    );
    const scan = () =>
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-rv])').forEach((el) => {
        el.style.transitionDelay = `${el.getAttribute('data-reveal') || 0}ms`;
        el.setAttribute('data-rv', 'pending');
        io.observe(el);
      });
    scan();
    const mo = new MutationObserver(() => requestAnimationFrame(scan));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (first) {
      setFirst(false);
      return;
    }
    document.getElementById('main')?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
