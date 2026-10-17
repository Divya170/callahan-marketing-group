import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ACCENTS, CONTENT_STATUSES, WORK_LAYOUTS, type ContentStatus, type WorkLayout } from '../../common/constants/domain';
import { SLUG_RE } from '../../common/utils/text';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpsertCaseStudyDto {
  @Transform(trim)
  @IsString({ message: 'Title is required.' })
  @MinLength(2, { message: 'Title must be at least 2 characters.' })
  @MaxLength(140, { message: 'Title must be 140 characters or fewer.' })
  title: string;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: UpsertCaseStudyDto) => !!o.slug)
  @Matches(SLUG_RE, { message: 'Use lowercase letters, numbers and hyphens only.' })
  @MaxLength(80)
  slug?: string;

  @Transform(trim)
  @IsString({ message: 'Summary is required.' })
  @MinLength(2, { message: 'Summary is required.' })
  @MaxLength(240, { message: 'Summary must be 240 characters or fewer.' })
  subtitle: string;

  @IsString({ message: 'Choose a service.' })
  @MinLength(1, { message: 'Choose a service.' })
  serviceSlug: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  client?: string;

  @Transform(trim)
  @IsString({ message: 'Add some context.' })
  @MinLength(10, { message: 'Add a little context (at least 10 characters).' })
  @MaxLength(4000)
  context: string;

  @Transform(trim)
  @IsString({ message: 'Describe the objectives.' })
  @MinLength(10, { message: 'Describe the objectives (at least 10 characters).' })
  @MaxLength(4000)
  objectives: string;

  @Transform(trim)
  @IsString({ message: 'Describe the approach.' })
  @MinLength(10, { message: 'Describe the approach (at least 10 characters).' })
  @MaxLength(4000)
  approach: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12, { message: 'Up to 12 deliverables.' })
  @IsString({ each: true })
  @MaxLength(140, { each: true, message: 'Each deliverable must be 140 characters or fewer.' })
  deliverables?: string[];

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(4000)
  results?: string;

  @IsIn(WORK_LAYOUTS as unknown as string[], { message: 'Choose a card layout.' })
  layout: WorkLayout;

  @IsIn(ACCENTS as unknown as string[], { message: 'Choose an accent colour.' })
  accent: string;

  @IsIn(CONTENT_STATUSES as unknown as string[], { message: 'Choose a status.' })
  status: ContentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;
}

export class ContentStatusDto {
  @IsIn(CONTENT_STATUSES as unknown as string[], { message: 'Status must be draft, published or archived.' })
  status: ContentStatus;
}
