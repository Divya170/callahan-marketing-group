import { Transform, Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { ACCENTS, CONTENT_STATUSES, type ContentStatus } from '../../common/constants/domain';
import { SLUG_RE } from '../../common/utils/text';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpsertArticleDto {
  @Transform(trim)
  @IsString({ message: 'Title is required.' })
  @MinLength(4, { message: 'Title must be at least 4 characters.' })
  @MaxLength(180, { message: 'Title must be 180 characters or fewer.' })
  title: string;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: UpsertArticleDto) => !!o.slug)
  @Matches(SLUG_RE, { message: 'Use lowercase letters, numbers and hyphens only.' })
  @MaxLength(80)
  slug?: string;

  @Transform(trim)
  @IsString({ message: 'Excerpt is required.' })
  @MinLength(10, { message: 'Excerpt must be at least 10 characters.' })
  @MaxLength(400, { message: 'Excerpt must be 400 characters or fewer.' })
  excerpt: string;

  @Transform(trim)
  @IsString({ message: 'Enter a category, e.g. SEO.' })
  @MinLength(2, { message: 'Enter a category, e.g. SEO.' })
  @MaxLength(60)
  category: string;

  @IsIn(ACCENTS as unknown as string[], { message: 'Choose an accent colour.' })
  accent: string;

  /** Plain-text body: "## Heading", "- list item", blank line between paragraphs. */
  @IsString({ message: 'Write the article body.' })
  @MinLength(20, { message: 'Write at least a short paragraph (20 characters).' })
  @MaxLength(50000)
  bodyText: string;

  @IsIn(CONTENT_STATUSES as unknown as string[], { message: 'Choose a status.' })
  status: ContentStatus;

  @IsOptional()
  @ValidateIf((o: UpsertArticleDto) => !!o.publishedAt)
  @IsDateString({}, { message: 'Enter a valid publish date.' })
  publishedAt?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;
}
