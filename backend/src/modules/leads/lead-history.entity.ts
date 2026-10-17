import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { LeadStatus } from '../../common/constants/domain';
import { Lead } from './lead.entity';

/** Audit trail of status changes on a lead. */
@Entity('lead_history')
export class LeadHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lead, (l) => l.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({ type: 'varchar', length: 24 })
  leadId: string;

  @Column({ type: 'varchar', length: 12 })
  status: LeadStatus;

  @Column({ type: 'datetime' })
  at: Date;
}
