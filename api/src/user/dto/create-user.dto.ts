import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEthereumAddress,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum.js';

export class CreateUserDto {
  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEthereumAddress()
  walletAddress: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;
}