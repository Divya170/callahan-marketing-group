import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { UpdateSettingsDto } from './settings.dto';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** Public site configuration (content mode, booking link, contact details). */
  @Get('site')
  site() {
    return this.settings.getPublicSite();
  }

  @UseGuards(AdminGuard)
  @Get('admin/settings')
  getAdmin() {
    return this.settings.getAll();
  }

  @UseGuards(AdminGuard)
  @Put('admin/settings')
  update(@Body() dto: UpdateSettingsDto) {
    const patch = { ...dto };
    if (patch.bookingUrl !== undefined) patch.bookingUrl = patch.bookingUrl.trim();
    if (patch.contactEmail) patch.contactEmail = patch.contactEmail.trim().toLowerCase();
    return this.settings.update(patch);
  }
}
