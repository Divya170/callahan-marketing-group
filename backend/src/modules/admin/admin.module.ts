import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { WorkModule } from '../work/work.module';
import { AdminContentController } from './admin-content.controller';

@Module({
  imports: [WorkModule, ArticlesModule],
  controllers: [AdminContentController],
})
export class AdminModule {}
