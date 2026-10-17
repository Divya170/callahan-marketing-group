import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ArticlesService } from '../articles/articles.service';
import { AdminGuard } from '../auth/admin.guard';
import { ServiceCatalogService } from '../service-catalog/service-catalog.service';
import { WorkService } from '../work/work.service';

/** Combined list of case studies and articles for the admin "Content" tab. */
@UseGuards(AdminGuard)
@Controller('admin/content')
export class AdminContentController {
  constructor(
    private readonly work: WorkService,
    private readonly articles: ArticlesService,
    private readonly catalog: ServiceCatalogService,
  ) {}

  @Get()
  async list(@Query('type') type?: string, @Query('status') status?: string, @Query('q') q?: string) {
    const [work, articles, names] = await Promise.all([this.work.adminList(), this.articles.adminList(), this.catalog.nameMap()]);
    let rows = [
      ...work.map((w) => ({
        id: w.id,
        type: 'work' as const,
        typeLabel: 'Case study',
        title: `${w.title} — ${w.subtitle}`,
        meta: names[w.serviceSlug] || w.serviceSlug,
        path: `work/${w.slug}`,
        status: w.status,
        updatedAt: w.updatedAt,
      })),
      ...articles.map((a) => ({
        id: a.id,
        type: 'article' as const,
        typeLabel: 'Article',
        title: a.title,
        meta: a.category,
        path: `insights/${a.slug}`,
        status: a.status,
        updatedAt: a.updatedAt,
      })),
    ];
    const counts = {
      all: rows.length,
      draft: rows.filter((r) => r.status === 'draft').length,
      published: rows.filter((r) => r.status === 'published').length,
      archived: rows.filter((r) => r.status === 'archived').length,
    };
    if (type === 'work' || type === 'article') rows = rows.filter((r) => r.type === type);
    if (status === 'draft' || status === 'published' || status === 'archived') rows = rows.filter((r) => r.status === status);
    const needle = (q || '').trim().toLowerCase();
    if (needle) rows = rows.filter((r) => `${r.title} ${r.meta} ${r.path}`.toLowerCase().includes(needle));
    return { items: rows, counts };
  }
}
