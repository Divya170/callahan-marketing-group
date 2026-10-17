import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OTHER_SERVICE } from '../../common/constants/domain';
import { MarketingService } from './marketing-service.entity';

@Injectable()
export class ServiceCatalogService {
  constructor(@InjectRepository(MarketingService) private readonly repo: Repository<MarketingService>) {}

  findAll(): Promise<MarketingService[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  /** slug -> full display name (long name if present). Includes the "other" option. */
  async nameMap(): Promise<Record<string, string>> {
    const all = await this.findAll();
    return { ...Object.fromEntries(all.map((s) => [s.slug, s.longName || s.name])), [OTHER_SERVICE.value]: OTHER_SERVICE.label };
  }

  /** Options for the enquiry form's "Service interest" select. */
  async formOptions(): Promise<{ value: string; label: string }[]> {
    const all = await this.findAll();
    return [...all.map((s) => ({ value: s.slug, label: s.longName || s.name })), { ...OTHER_SERVICE }];
  }

  async exists(slug: string): Promise<boolean> {
    return (await this.repo.count({ where: { slug } })) > 0;
  }
}
