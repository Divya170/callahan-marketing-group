import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './modules/health/health.controller';
import { LeadsModule } from './modules/leads/leads.module';
import { ServiceCatalogModule } from './modules/service-catalog/service-catalog.module';
import { SettingsModule } from './modules/settings/settings.module';
import { WorkModule } from './modules/work/work.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], envFilePath: ['.env'] }),
    DatabaseModule,
    AuthModule,
    SettingsModule,
    ServiceCatalogModule,
    WorkModule,
    ArticlesModule,
    LeadsModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
