import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormTokenService } from './form-token.service';
import { LeadHistory } from './lead-history.entity';
import { Lead } from './lead.entity';
import { AdminLeadsController, LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, LeadHistory])],
  controllers: [LeadsController, AdminLeadsController],
  providers: [LeadsService, FormTokenService],
})
export class LeadsModule {}
