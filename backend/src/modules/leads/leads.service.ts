import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import {
  BUDGETS,
  CONTACT_METHODS,
  LEAD_RULES,
  LEAD_STATUS_LABEL,
  LEAD_STATUSES,
  LEADS_PAGE_SIZE,
  TIMELINES,
  type LeadStatus,
} from '../../common/constants/domain';
import { csvCell } from '../../common/utils/text';
import { AppConfig } from '../../config/configuration';
import { ServiceCatalogService } from '../service-catalog/service-catalog.service';
import { SettingsService } from '../settings/settings.service';
import { FormTokenService } from './form-token.service';
import { LeadHistory } from './lead-history.entity';
import { Lead } from './lead.entity';
import { sanitizeLead, validateLead } from './lead-validator';
import { LeadQueryDto, SubmitLeadDto } from './leads.dto';

export interface SubmitContext {
  ip: string;
  userAgent: string;
}

@Injectable()
export class LeadsService {
  private readonly secret: string;

  constructor(
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    @InjectRepository(LeadHistory) private readonly history: Repository<LeadHistory>,
    private readonly catalog: ServiceCatalogService,
    private readonly settings: SettingsService,
    private readonly tokens: FormTokenService,
    config: ConfigService,
  ) {
    this.secret = config.get<AppConfig>('app')!.appSecret;
  }

  private hashIp(ip: string): string {
    return createHash('sha256').update(`${this.secret}:${ip}`).digest('hex');
  }

  private static newId(now: number): string {
    return 'CMG-' + now.toString(36).toUpperCase();
  }

  /** Options the enquiry form offers. */
  async options() {
    return {
      services: await this.catalog.formOptions(),
      budgets: [...BUDGETS],
      timelines: [...TIMELINES],
      methods: [...CONTACT_METHODS],
    };
  }

  issueFormToken() {
    return { token: this.tokens.issue() };
  }

  /** Handles a public enquiry. Throws HTTP errors with visitor-friendly messages. */
  async submit(dto: SubmitLeadDto, ctx: SubmitContext): Promise<{ id: string }> {
    const site = await this.settings.getAll();
    const now = Date.now();

    if (site.simulateServerError) {
      throw new ServiceUnavailableException({
        message: `Something went wrong on our side. Please try again, or email ${site.contactEmail}.`,
      });
    }

    // Honeypot filled: pretend success, store nothing.
    if (dto.hp && String(dto.hp).trim()) return { id: LeadsService.newId(now) };

    const token = this.tokens.check(dto.formToken, now);
    if (!token.ok) {
      if (token.reason === 'too-fast') {
        throw new BadRequestException({ message: 'That was very quick. Please check your details and try again.' });
      }
      throw new BadRequestException({
        message: 'This form has expired. Please refresh the page and try again.',
      });
    }

    const ipHash = this.hashIp(ctx.ip);
    const recent = await this.leads.count({
      where: { ipHash, createdAt: MoreThan(new Date(now - LEAD_RULES.rateWindowMs)) },
    });
    if (recent >= LEAD_RULES.rateMax) {
      throw new HttpException(
        { message: 'Too many enquiries from this connection. Please wait a few minutes, or email us directly.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const services = (await this.catalog.formOptions()).map((o) => o.value);
    const errors = validateLead(dto, services);
    if (Object.keys(errors).length) {
      throw new UnprocessableEntityException({ message: 'Please fix the highlighted fields.', errors });
    }

    let id = LeadsService.newId(now);
    if (await this.leads.exist({ where: { id } })) id += randomBytes(2).toString('hex').toUpperCase();

    const at = new Date(now);
    const lead = this.leads.create({
      id,
      ...sanitizeLead(dto),
      status: 'new',
      statusChangedAt: at,
      createdAt: at,
      notes: '',
      ipHash,
      userAgent: String(ctx.userAgent || '').slice(0, 300),
      history: [this.history.create({ status: 'new', at })],
    });
    await this.leads.save(lead);
    return { id };
  }

  // ---------- admin ----------

  private filteredQuery(q?: string, status?: string) {
    const qb = this.leads.createQueryBuilder('l');
    if (status && status !== 'all') qb.andWhere('l.status = :status', { status });
    if (q) {
      const like = `%${q.toLowerCase().replace(/[%_]/g, (m) => '\\' + m)}%`;
      qb.andWhere("(LOWER(l.name) LIKE :like ESCAPE '\\' OR LOWER(l.company) LIKE :like ESCAPE '\\' OR LOWER(l.email) LIKE :like ESCAPE '\\')", {
        like,
      });
    }
    return qb.orderBy('l.createdAt', 'DESC').addOrderBy('l.id', 'DESC');
  }

  async list(query: LeadQueryDto) {
    const pageSize = query.pageSize || LEADS_PAGE_SIZE;
    const qb = this.filteredQuery(query.q, query.status);
    const filtered = await qb.getCount();
    const pages = Math.max(1, Math.ceil(filtered / pageSize));
    const page = Math.min(Math.max(1, query.page || 1), pages);
    const rows = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const names = await this.catalog.nameMap();
    const grouped = await this.leads.createQueryBuilder('l').select('l.status', 'status').addSelect('COUNT(*)', 'n').groupBy('l.status').getRawMany<{ status: string; n: number }>();
    const counts: Record<string, number> = { all: 0, ...Object.fromEntries(LEAD_STATUSES.map((s) => [s.value, 0])) };
    for (const g of grouped) {
      counts[g.status] = Number(g.n);
      counts.all += Number(g.n);
    }

    return {
      items: rows.map((l) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        email: l.email,
        service: l.service,
        serviceName: names[l.service] || l.service,
        status: l.status,
        statusLabel: LEAD_STATUS_LABEL[l.status],
        createdAt: l.createdAt,
      })),
      total: filtered,
      page,
      pages,
      pageSize,
      counts,
      statuses: LEAD_STATUSES,
    };
  }

  async get(id: string) {
    const lead = await this.leads.findOne({ where: { id }, relations: { history: true } });
    if (!lead) throw new NotFoundException({ message: 'This lead no longer exists.' });
    const names = await this.catalog.nameMap();
    const { ipHash: _ip, ...rest } = lead;
    return {
      ...rest,
      serviceName: names[lead.service] || lead.service,
      statusLabel: LEAD_STATUS_LABEL[lead.status],
      history: (lead.history || [])
        .sort((a, b) => a.at.getTime() - b.at.getTime() || a.id - b.id)
        .map((h) => ({ status: h.status, label: LEAD_STATUS_LABEL[h.status], at: h.at })),
    };
  }

  async setStatus(id: string, status: LeadStatus) {
    const lead = await this.leads.findOne({ where: { id } });
    if (!lead) throw new NotFoundException({ message: 'This lead no longer exists.' });
    if (lead.status !== status) {
      const at = new Date();
      lead.status = status;
      lead.statusChangedAt = at;
      await this.leads.save(lead);
      await this.history.save(this.history.create({ leadId: id, status, at }));
    }
    return this.get(id);
  }

  async setNotes(id: string, notes: string) {
    const lead = await this.leads.findOne({ where: { id } });
    if (!lead) throw new NotFoundException({ message: 'This lead no longer exists.' });
    lead.notes = notes.trim();
    await this.leads.save(lead);
    return this.get(id);
  }

  async remove(id: string) {
    const lead = await this.leads.findOne({ where: { id } });
    if (!lead) throw new NotFoundException({ message: 'This lead no longer exists.' });
    await this.history.delete({ leadId: id });
    await this.leads.remove(lead);
    return { deleted: true };
  }

  async exportCsv(q?: string, status?: string): Promise<string> {
    const rows = await this.filteredQuery(q, status).getMany();
    const names = await this.catalog.nameMap();
    const header = ['Reference', 'Received', 'Status', 'Name', 'Company', 'Email', 'Phone', 'Preferred contact', 'Service', 'Website', 'Budget', 'Timeline', 'Project goals', 'Notes'];
    const lines = rows.map((l) =>
      [
        l.id,
        l.createdAt.toISOString(),
        LEAD_STATUS_LABEL[l.status],
        l.name,
        l.company,
        l.email,
        l.phone,
        l.method,
        names[l.service] || l.service,
        l.website,
        l.budget,
        l.timeline,
        l.goals,
        l.notes,
      ]
        .map(csvCell)
        .join(','),
    );
    return '﻿' + [header.join(','), ...lines].join('\r\n');
  }
}
