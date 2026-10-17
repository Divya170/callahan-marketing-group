import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { LEAD_STATUS_VALUES, type LeadStatus } from '../../common/constants/domain';

/**
 * Raw enquiry body. Field rules are enforced by validateLead() so the visitor gets the
 * exact, friendly per-field messages; this DTO only whitelists the accepted keys.
 */
export class SubmitLeadDto {
  @IsOptional() name?: string;
  @IsOptional() email?: string;
  @IsOptional() company?: string;
  @IsOptional() website?: string;
  @IsOptional() service?: string;
  @IsOptional() goals?: string;
  @IsOptional() budget?: string;
  @IsOptional() timeline?: string;
  @IsOptional() method?: string;
  @IsOptional() phone?: string;
  /** Honeypot — must stay empty. */
  @IsOptional() hp?: string;
  @IsOptional() formToken?: string;
}

export class LeadQueryDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(['all', ...LEAD_STATUS_VALUES])
  status?: 'all' | LeadStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class LeadStatusDto {
  @IsIn(LEAD_STATUS_VALUES, { message: 'Status must be New, In Review, Contacted or Closed.' })
  status: LeadStatus;
}

export class LeadNotesDto {
  @IsString()
  @MaxLength(5000, { message: 'Notes must be 5,000 characters or fewer.' })
  notes: string;
}
