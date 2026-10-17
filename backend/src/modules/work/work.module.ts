import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseStudy } from './case-study.entity';
import { AdminWorkController, WorkController } from './work.controller';
import { WorkService } from './work.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaseStudy])],
  controllers: [WorkController, AdminWorkController],
  providers: [WorkService],
  exports: [WorkService],
})
export class WorkModule {}
