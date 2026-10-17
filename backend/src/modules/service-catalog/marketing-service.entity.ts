import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface ServiceGlyph {
  left: string;
  top: string;
  size: string;
  color: string;
}

export interface ServicePoint {
  title: string;
  text?: string;
}

/** A service the agency offers. Drives the home list, services page, footer, form options and work filters. */
@Entity('services')
export class MarketingService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, unique: true })
  slug: string;

  /** Display number, e.g. "01". */
  @Column({ type: 'varchar', length: 4 })
  number: string;

  /** Short name used in navigation and filters, e.g. "SEO". */
  @Column({ type: 'varchar', length: 80 })
  name: string;

  /** Full name used in forms and labels, e.g. "Search Engine Optimization". */
  @Column({ type: 'varchar', length: 120, nullable: true })
  longName: string | null;

  @Column({ type: 'text' })
  shortDescription: string;

  @Column({ type: 'simple-json' })
  glyph: ServiceGlyph;

  @Column({ type: 'varchar', length: 200 })
  headline: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  audience: string | null;

  @Column({ type: 'text', nullable: true })
  extra: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  pointsLabel: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  pointsNote: string | null;

  @Column({ type: 'simple-json' })
  points: ServicePoint[];

  @Column({ type: 'varchar', length: 120 })
  ctaLabel: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  visualLabel: string | null;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;
}
