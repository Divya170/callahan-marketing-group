import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { ContentStatus } from '../../common/constants/domain';
import { parseArticleBody, serializeArticleBody } from '../../common/utils/article-body';
import { slugify } from '../../common/utils/text';
import { visibleStatuses } from '../../common/utils/visibility';
import { SettingsService } from '../settings/settings.service';
import { Article } from './article.entity';
import { UpsertArticleDto } from './articles.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article) private readonly repo: Repository<Article>,
    private readonly settings: SettingsService,
  ) {}

  private async visible(): Promise<Article[]> {
    const preview = await this.settings.isPreview();
    const items = await this.repo.find({ where: { status: In(visibleStatuses(preview)) } });
    // Published articles first (newest first), then drafts in editorial order.
    return items.sort((a, b) => {
      const ap = a.status === 'published' ? 0 : 1;
      const bp = b.status === 'published' ? 0 : 1;
      if (ap !== bp) return ap - bp;
      if (ap === 0) {
        const diff = (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0);
        if (diff) return diff;
      }
      return a.sortOrder - b.sortOrder || a.id - b.id;
    });
  }

  private card(a: Article) {
    return {
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      accent: a.accent,
      isDraft: a.status === 'draft',
      publishedAt: a.status === 'published' ? a.publishedAt : null,
    };
  }

  async listPublic(cat?: string) {
    const items = await this.visible();
    const categories = [...new Set(items.map((a) => a.category))];
    const activeCat = cat && categories.includes(cat) ? cat : 'all';
    const list = activeCat === 'all' ? items : items.filter((a) => a.category === activeCat);
    return {
      items: list.map((a) => this.card(a)),
      categories: categories.length > 1 ? categories : [],
      activeCat,
      total: items.length,
    };
  }

  async getPublic(slug: string) {
    const items = await this.visible();
    const a = items.find((x) => x.slug === slug);
    if (!a) throw new NotFoundException({ message: 'This article doesn’t exist or isn’t published yet.' });
    const others = items.filter((x) => x.slug !== slug);
    // Related: same category first, then the rest; at most two.
    const related = [...others.filter((x) => x.category === a.category), ...others.filter((x) => x.category !== a.category)]
      .slice(0, 2)
      .map((x) => ({ slug: x.slug, title: x.title, category: x.category }));
    return { item: { ...this.card(a), body: a.body || [] }, related };
  }

  // ---------- admin ----------

  async adminList() {
    return this.repo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async adminGet(id: number) {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException({ message: 'Article not found.' });
    return { ...a, bodyText: serializeArticleBody(a.body) };
  }

  private async entity(id: number) {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException({ message: 'Article not found.' });
    return a;
  }

  private async prepare(dto: UpsertArticleDto, id?: number): Promise<Partial<Article>> {
    const slug = dto.slug || slugify(dto.title);
    if (!slug) throw new BadRequestException({ message: 'Please check the highlighted fields.', errors: { slug: 'Enter a URL slug.' } });
    const clash = await this.repo.findOne({ where: { slug } });
    if (clash && clash.id !== id) {
      throw new ConflictException({ message: 'That URL slug is already used.', errors: { slug: 'Another article already uses this slug.' } });
    }
    const body = parseArticleBody(dto.bodyText);
    if (!body.length) {
      throw new BadRequestException({ message: 'Please check the highlighted fields.', errors: { bodyText: 'The article body is empty.' } });
    }
    return {
      title: dto.title,
      slug,
      excerpt: dto.excerpt,
      category: dto.category,
      accent: dto.accent,
      body,
      status: dto.status,
      ...(dto.publishedAt !== undefined ? { publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
    };
  }

  private stamp(entity: Article, status: ContentStatus) {
    if (status === 'published' && !entity.publishedAt) entity.publishedAt = new Date();
  }

  async create(dto: UpsertArticleDto) {
    const data = await this.prepare(dto);
    if (dto.sortOrder === undefined) {
      const max = await this.repo.maximum('sortOrder');
      data.sortOrder = (max ?? 0) + 1;
    }
    const entity = this.repo.create(data);
    this.stamp(entity, dto.status);
    const saved = await this.repo.save(entity);
    return this.adminGet(saved.id);
  }

  async update(id: number, dto: UpsertArticleDto) {
    const entity = await this.entity(id);
    Object.assign(entity, await this.prepare(dto, id));
    this.stamp(entity, dto.status);
    await this.repo.save(entity);
    return this.adminGet(id);
  }

  async setStatus(id: number, status: ContentStatus) {
    const entity = await this.entity(id);
    entity.status = status;
    this.stamp(entity, status);
    await this.repo.save(entity);
    return this.adminGet(id);
  }

  async remove(id: number) {
    const entity = await this.entity(id);
    await this.repo.remove(entity);
    return { deleted: true };
  }
}
