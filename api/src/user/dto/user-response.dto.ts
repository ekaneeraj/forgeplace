import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto.js';
import { UserRole } from '../enums/user-role.enum.js';

export class UserResponseDto {
  @ApiProperty({ example: 'bfe6f8a4-...' })
  id: string;

  @ApiProperty({ example: '0x7a25...Address' })
  walletAddress: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  profileImageUrl?: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserResponseEnvelope extends ApiResponseDto<UserResponseDto> {
  @ApiProperty({ type: UserResponseDto })
  data: UserResponseDto = null as unknown as UserResponseDto;
}

export class UserListResponseEnvelope extends ApiResponseDto<UserResponseDto[]> {
  @ApiProperty({ type: UserResponseDto, isArray: true })
  data: UserResponseDto[] = null as unknown as UserResponseDto[];
}

export class MeResponseDto {
  @ApiProperty({ example: 'bfe6f8a4-...' })
  id: string;

  @ApiProperty({ example: '0x7a25...Address' })
  walletAddress: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  profileImageUrl?: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MeResponseEnvelope extends ApiResponseDto<MeResponseDto> {
  @ApiProperty({ type: MeResponseDto })
  data: MeResponseDto = null as unknown as MeResponseDto;
}