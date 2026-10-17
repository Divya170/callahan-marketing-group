import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadConfig } from '../../config/configuration';
import { dataSourceOptions } from '../data-source';
import { resetDatabase, seedDatabase } from './seeder';

async function main() {
  const cfg = loadConfig();
  const ds = new DataSource({ ...dataSourceOptions(cfg), synchronize: true });
  await ds.initialize();
  if (process.argv.includes('--reset')) await resetDatabase(ds);
  await seedDatabase(ds);
  await ds.destroy();
  console.log(`Database ready at ${cfg.databasePath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
