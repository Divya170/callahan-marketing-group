import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { ContentStatusDto } from '../work/work.dto';
import { UpsertArticleDto } from './articles.dto';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  list(@Query('cat') cat?: string) {
    return this.articles.listPublic(cat);
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.articles.getPublic(slug);
  }
}

@UseGuards(AdminGuard)
@Controller('admin/articles')
export class AdminArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  list() {
    return this.articles.adminList();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.articles.adminGet(id);
  }

  @Post()
  create(@Body() dto: UpsertArticleDto) {
    return this.articles.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertArticleDto) {
    return this.articles.update(id, dto);
  }

  @Patch(':id/status')
  status(@Param('id', ParseIntPipe) id: number, @Body() dto: ContentStatusDto) {
    return this.articles.setStatus(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articles.remove(id);
  }
}
