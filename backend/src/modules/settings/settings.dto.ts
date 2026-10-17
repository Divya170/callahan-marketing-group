import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { CONTENT_MODES, type ContentMode } from '../../common/constants/domain';

export class UpdateSettingsDto {
  @IsOptional()
  @IsIn(CONTENT_MODES as unknown as string[], { message: 'Content mode must be preview or production.' })
  contentMode?: ContentMode;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ValidateIf((o: UpdateSettingsDto) => !!o.bookingUrl && o.bookingUrl.trim() !== '')
  @Matches(/^https:\/\/\S+$/i, { message: 'Booking link must start with https:// (or be left empty).' })
  bookingUrl?: string;

  @IsOptional()
  @IsBoolean()
  simulateServerError?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Contact name is required.' })
  @MaxLength(100)
  contactName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254)
  contactEmail?: string;

  @IsOptional()
  @Matches(/^[+()\d\s.-]{7,30}$/, { message: 'Enter a valid phone number.' })
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Street address is required.' })
  @MaxLength(120)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'City, state and ZIP are required.' })
  @MaxLength(120)
  addressLine2?: string;
}
