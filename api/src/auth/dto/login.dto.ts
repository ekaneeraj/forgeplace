import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEthereumAddress, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsString()
  timestamp: string;
}