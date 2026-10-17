import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { clientIp } from '../../common/utils/client-ip';
import { AdminGuard } from '../auth/admin.guard';
import { LeadNotesDto, LeadQueryDto, LeadStatusDto, SubmitLeadDto } from './leads.dto';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  /** Select options for the project brief form. */
  @Get('options')
  options() {
    return this.leads.options();
  }

  /** Issued when the form opens; required on submit. */
  @Get('form-token')
  @Header('Cache-Control', 'no-store')
  token() {
    return this.leads.issueFormToken();
  }

  @Post()
  submit(@Body() dto: SubmitLeadDto, @Req() req: Request) {
    return this.leads.submit(dto, { ip: clientIp(req), userAgent: String(req.headers['user-agent'] || '') });
  }
}

@UseGuards(AdminGuard)
@Controller('admin/leads')
export class AdminLeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list(@Query() query: LeadQueryDto) {
    return this.leads.list(query);
  }

  @Get('export')
  async export(@Query() query: LeadQueryDto, @Res() res: Response) {
    const csv = await this.leads.exportCsv(query.q, query.status);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cmg-leads-${date}.csv"`);
    res.send(csv);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.leads.get(id);
  }

  @Patch(':id/status')
  status(@Param('id') id: string, @Body() dto: LeadStatusDto) {
    return this.leads.setStatus(id, dto.status);
  }

  @Patch(':id/notes')
  notes(@Param('id') id: string, @Body() dto: LeadNotesDto) {
    return this.leads.setNotes(id, dto.notes);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leads.remove(id);
  }
}
