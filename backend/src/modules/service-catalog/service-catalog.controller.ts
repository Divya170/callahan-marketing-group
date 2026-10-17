import { Controller, Get } from '@nestjs/common';
import { ServiceCatalogService } from './service-catalog.service';

@Controller('services')
export class ServiceCatalogController {
  constructor(private readonly catalog: ServiceCatalogService) {}

  @Get()
  async list() {
    const items = await this.catalog.findAll();
    return items.map(({ id: _id, sortOrder: _s, ...rest }) => rest);
  }
}
