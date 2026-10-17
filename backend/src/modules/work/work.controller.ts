import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { ContentStatusDto, UpsertCaseStudyDto } from './work.dto';
import { WorkService } from './work.service';

@Controller('work')
export class WorkController {
  constructor(private readonly work: WorkService) {}

  @Get()
  list(@Query('cat') cat?: string, @Query('limit') limit?: string) {
    const n = Number(limit);
    return this.work.listPublic(cat, Number.isFinite(n) && n > 0 ? Math.min(n, 50) : undefined);
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.work.getPublic(slug);
  }
}

@UseGuards(AdminGuard)
@Controller('admin/work')
export class AdminWorkController {
  constructor(private readonly work: WorkService) {}

  @Get()
  list() {
    return this.work.adminList();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.work.adminGet(id);
  }

  @Post()
  create(@Body() dto: UpsertCaseStudyDto) {
    return this.work.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertCaseStudyDto) {
    return this.work.update(id, dto);
  }

  @Patch(':id/status')
  status(@Param('id', ParseIntPipe) id: number, @Body() dto: ContentStatusDto) {
    return this.work.setStatus(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.work.remove(id);
  }
}
