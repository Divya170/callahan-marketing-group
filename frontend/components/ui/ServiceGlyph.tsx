import type { ServiceItem } from '@/lib/types';

/** Small circular glyph that gives each service its own mark. */
export function ServiceGlyph({ g }: { g: ServiceItem['glyph'] }) {
  return (
    <span aria-hidden="true" className="svc-glyph">
      <span style={{ left: g.left, top: g.top, width: g.size, height: g.size, background: g.color }} />
    </span>
  );
}
