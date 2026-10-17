import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { ContentStatus, WorkLayout } from '../../common/constants/domain';

/** A piece of work (case study or concept study). */
@Entity('case_studies')
export class CaseStudy {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  slug: string;

  @Column({ type: 'varchar', length: 140 })
  title: string;

  @Column({ type: 'varchar', length: 240 })
  subtitle: string;

  /** Slug of the related service (see services table). */
  @Column({ type: 'varchar', length: 80 })
  serviceSlug: string;

  @Column({ type: 'varchar', length: 160, default: '' })
  client: string;

  @Column({ type: 'text', default: '' })
  context: string;

  @Column({ type: 'text', default: '' })
  objectives: string;

  @Column({ type: 'text', default: '' })
  approach: string;

  @Column({ type: 'simple-json' })
  deliverables: string[];

  @Column({ type: 'text', default: '' })
  results: string;

  @Column({ type: 'varchar', length: 16, default: 'landscape' })
  layout: WorkLayout;

  @Column({ type: 'varchar', length: 9, default: '#6941C6' })
  accent: string;

  @Index()
  @Column({ type: 'varchar', length: 12, default: 'draft' })
  status: ContentStatus;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
