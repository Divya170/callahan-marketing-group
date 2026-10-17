import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { ContentStatus } from '../../common/constants/domain';
import { slugify } from '../../common/utils/text';
import { visibleStatuses } from '../../common/utils/visibility';
import { ServiceCatalogService } from '../service-catalog/service-catalog.service';
import { SettingsService } from '../settings/settings.service';
import { CaseStudy } from './case-study.entity';
import { UpsertCaseStudyDto } from './work.dto';

export const RESULTS_FALLBACK =
  'This case study focuses on scope and approach. Measurable outcomes are only shown when evidence has been supplied and approved.';

@Injectable()
export class WorkService {
  constructor(
    @InjectRepository(CaseStudy) private readonly repo: Repository<CaseStudy>,
    private readonly settings: SettingsService,
    private readonly catalog: ServiceCatalogService,
  ) {}

  private async visible(): Promise<{ items: CaseStudy[]; preview: boolean }> {
    const preview = await this.settings.isPreview();
    const items = await this.repo.find({
      where: { status: In(visibleStatuses(preview)) },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return { items, preview };
  }

  private card(w: CaseStudy, names: Record<string, string>) {
    return {
      slug: w.slug,
      title: w.title,
      subtitle: w.subtitle,
      serviceSlug: w.serviceSlug,
      serviceName: names[w.serviceSlug] || w.serviceSlug,
      layout: w.layout,
      accent: w.accent,
      isDraft: w.status === 'draft',
    };
  }

  /** Public work list with service filters and counts. */
  async listPublic(cat?: string, limit?: number) {
    const [{ items }, services, names] = await Promise.all([this.visible(), this.catalog.findAll(), this.catalog.nameMap()]);
    const cats = services.filter((s) => items.some((w) => w.serviceSlug === s.slug));
    const filters = [
      { slug: 'all', name: 'All Work', count: items.length },
      ...cats.map((c) => ({ slug: c.slug, name: c.name, count: items.filter((w) => w.serviceSlug === c.slug).length })),
    ];
    const activeCat = cat && cats.some((c) => c.slug === cat) ? cat : 'all';
    let list = activeCat === 'all' ? items : items.filter((w) => w.serviceSlug === activeCat);
    const filtered = list.length;
    if (limit && limit > 0) list = list.slice(0, limit);
    return {
      items: list.map((w) => this.card(w, names)),
      filters: cats.length > 1 ? filters : [],
      activeCat,
      total: items.length,
      filtered,
    };
  }

  /** Public case study detail, plus the "next project" link. */
  async getPublic(slug: string) {
    const [{ items }, names] = await Promise.all([this.visible(), this.catalog.nameMap()]);
    const idx = items.findIndex((w) => w.slug === slug);
    if (idx === -1) throw new NotFoundException({ message: 'This project doesn’t exist or isn’t published yet.' });
    const w = items[idx];
    const draft = w.status === 'draft';
    const next = items.length > 1 ? items[(idx + 1) % items.length] : null;
    return {
      item: {
        ...this.card(w, names),
        client: draft ? 'Not applicable — concept study' : w.client || 'To be supplied with approved case study',
        statusLabel: draft ? 'Concept study (draft)' : 'Published',
        context: w.context,
        objectives: w.objectives,
        approach: w.approach,
        deliverables: w.deliverables || [],
        results: w.results || RESULTS_FALLBACK,
        publishedAt: w.publishedAt,
      },
      next: next ? { slug: next.slug, title: next.title } : null,
    };
  }

  // ---------- admin ----------

  async adminList() {
    return this.repo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async adminGet(id: number) {
    const w = await this.repo.findOne({ where: { id } });
    if (!w) throw new NotFoundException({ message: 'Case study not found.' });
    return w;
  }

  private async prepare(dto: UpsertCaseStudyDto, id?: number): Promise<Partial<CaseStudy>> {
    if (!(await this.catalog.exists(dto.serviceSlug))) {
      throw new BadRequestException({ message: 'Please check the highlighted fields.', errors: { serviceSlug: 'Choose a service.' } });
    }
    const slug = dto.slug || slugify(dto.title);
    if (!slug) throw new BadRequestException({ message: 'Please check the highlighted fields.', errors: { slug: 'Enter a URL slug.' } });
    const clash = await this.repo.findOne({ where: { slug } });
    if (clash && clash.id !== id) {
      throw new ConflictException({ message: 'That URL slug is already used.', errors: { slug: 'Another case study already uses this slug.' } });
    }
    return {
      title: dto.title,
      slug,
      subtitle: dto.subtitle,
      serviceSlug: dto.serviceSlug,
      client: dto.client || '',
      context: dto.context,
      objectives: dto.objectives,
      approach: dto.approach,
      deliverables: (dto.deliverables || []).map((d) => d.trim()).filter(Boolean),
      results: dto.results || '',
      layout: dto.layout,
      accent: dto.accent,
      status: dto.status,
      sortOrder: dto.sortOrder ?? 0,
    };
  }

  private stamp(entity: CaseStudy, status: ContentStatus) {
    if (status === 'published' && !entity.publishedAt) entity.publishedAt = new Date();
  }

  async create(dto: UpsertCaseStudyDto) {
    const data = await this.prepare(dto);
    if (dto.sortOrder === undefined) {
      const max = await this.repo.maximum('sortOrder');
      data.sortOrder = (max ?? 0) + 1;
    }
    const entity = this.repo.create(data);
    this.stamp(entity, dto.status);
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpsertCaseStudyDto) {
    const entity = await this.adminGet(id);
    Object.assign(entity, await this.prepare(dto, id));
    this.stamp(entity, dto.status);
    return this.repo.save(entity);
  }

  async setStatus(id: number, status: ContentStatus) {
    const entity = await this.adminGet(id);
    entity.status = status;
    this.stamp(entity, status);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.adminGet(id);
    await this.repo.remove(entity);
    return { deleted: true };
  }
}
