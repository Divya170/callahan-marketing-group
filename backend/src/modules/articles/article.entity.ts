import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { ContentStatus } from '../../common/constants/domain';
import type { ArticleBlock } from '../../common/utils/article-body';

/** An Insights article. */
@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  slug: string;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'text' })
  excerpt: string;

  @Column({ type: 'varchar', length: 60 })
  category: string;

  @Column({ type: 'varchar', length: 9, default: '#6941C6' })
  accent: string;

  @Column({ type: 'simple-json' })
  body: ArticleBlock[];

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
