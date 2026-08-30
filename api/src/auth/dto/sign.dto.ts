import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEthereumAddress, IsString } from 'class-validator';

export class SignDto {
  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  privateKey: string;
}