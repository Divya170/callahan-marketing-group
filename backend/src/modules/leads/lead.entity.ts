import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { ContactMethod, LeadStatus } from '../../common/constants/domain';
import { LeadHistory } from './lead-history.entity';

/** A project enquiry submitted through the contact form. */
@Entity('leads')
export class Lead {
  /** Public reference shown to the visitor, e.g. CMG-MGS3K2QZ. */
  @PrimaryColumn({ type: 'varchar', length: 24 })
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 12, default: 'new' })
  status: LeadStatus;

  @Column({ type: 'datetime' })
  statusChangedAt: Date;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 120 })
  company: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  website: string;

  @Column({ type: 'varchar', length: 80 })
  service: string;

  @Column({ type: 'text' })
  goals: string;

  @Column({ type: 'varchar', length: 40 })
  budget: string;

  @Column({ type: 'varchar', length: 40 })
  timeline: string;

  @Column({ type: 'varchar', length: 10 })
  method: ContactMethod;

  @Column({ type: 'varchar', length: 30, default: '' })
  phone: string;

  /** Internal notes written by the team in the admin. */
  @Column({ type: 'text', default: '' })
  notes: string;

  /** Hashed client IP, used only for rate limiting. */
  @Index()
  @Column({ type: 'varchar', length: 64, default: '' })
  ipHash: string;

  @Column({ type: 'varchar', length: 300, default: '' })
  userAgent: string;

  @OneToMany(() => LeadHistory, (h) => h.lead, { cascade: true })
  history: LeadHistory[];

  @Index()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
