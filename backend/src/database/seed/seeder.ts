import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Article } from '../../modules/articles/article.entity';
import { MarketingService } from '../../modules/service-catalog/marketing-service.entity';
import { Setting } from '../../modules/settings/setting.entity';
import { DEFAULT_SETTINGS } from '../../modules/settings/settings.service';
import { CaseStudy } from '../../modules/work/case-study.entity';
import { SEED_ARTICLES, SEED_SERVICES, SEED_WORK, SEED_WORK_DETAIL } from './seed-data';

const log = new Logger('Seeder');

/**
 * Seeds reference content into empty tables. Idempotent: tables that already
 * contain rows are left alone, so editors' changes are never overwritten.
 */
export async function seedDatabase(ds: DataSource): Promise<void> {
  const services = ds.getRepository(MarketingService);
  if ((await services.count()) === 0) {
    await services.save(SEED_SERVICES.map((s, i) => services.create({ ...s, sortOrder: i + 1 })));
    log.log(`Seeded ${SEED_SERVICES.length} services`);
  }

  const work = ds.getRepository(CaseStudy);
  if ((await work.count()) === 0) {
    await work.save(SEED_WORK.map((w, i) => work.create({ ...w, ...SEED_WORK_DETAIL, status: 'draft', sortOrder: i + 1 })));
    log.log(`Seeded ${SEED_WORK.length} case studies (draft)`);
  }

  const articles = ds.getRepository(Article);
  if ((await articles.count()) === 0) {
    await articles.save(SEED_ARTICLES.map((a, i) => articles.create({ ...a, status: 'draft', sortOrder: i + 1 })));
    log.log(`Seeded ${SEED_ARTICLES.length} articles (draft)`);
  }

  const settings = ds.getRepository(Setting);
  const existing = new Set((await settings.find()).map((s) => s.key));
  const missing = Object.entries(DEFAULT_SETTINGS).filter(([k]) => !existing.has(k));
  if (missing.length) {
    await settings.save(missing.map(([key, value]) => settings.create({ key, value: JSON.stringify(value) })));
    log.log(`Seeded ${missing.length} settings`);
  }
}

/** Removes all data (used by `npm run seed:reset`). */
export async function resetDatabase(ds: DataSource): Promise<void> {
  await ds.dropDatabase();
  await ds.synchronize();
  log.warn('Database reset');
}
