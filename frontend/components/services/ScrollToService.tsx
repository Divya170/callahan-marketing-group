'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/** Scrolls to the section named in ?s=<service-slug> (used by footer and home links). */
export function ScrollToService() {
  const s = useSearchParams().get('s');
  useEffect(() => {
    if (!s) return;
    const t = setTimeout(() => {
      const el = document.getElementById(s);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80 });
    }, 60);
    return () => clearTimeout(t);
  }, [s]);
  return null;
}
