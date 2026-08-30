import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto.js';
import { MeResponseDto } from '../../user/dto/user-response.dto.js';

export class SignResponseDto {
  @ApiProperty({ example: '0x...' })
  signature: string;

  @ApiProperty({ example: '1725705600' })
  timestamp: string;

  @ApiProperty({ example: '0x7a25...Address' })
  walletAddress: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: MeResponseDto })
  user: MeResponseDto;

  @ApiProperty({ example: 1725705600 })
  timestamp: number;
}

export class SignResponseEnvelope extends ApiResponseDto<SignResponseDto> {
  @ApiProperty({ type: SignResponseDto })
  data: SignResponseDto = null as unknown as SignResponseDto;
}

export class LoginResponseEnvelope extends ApiResponseDto<LoginResponseDto> {
  @ApiProperty({ type: LoginResponseDto })
  data: LoginResponseDto = null as unknown as LoginResponseDto;
}