import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/dto/api-response.dto.js';
import { AuthService } from './auth.service.js';
import {
  LoginResponseEnvelope,
  SignResponseEnvelope,
} from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { SignDto } from './dto/sign.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign')
  @ApiCreatedResponse({ type: SignResponseEnvelope })
  async sign(@Body() dto: SignDto) {
    if (!dto.privateKey || !dto.walletAddress) {
      throw new BadRequestException('walletAddress and privateKey are required');
    }
    const result = await this.authService.sign(dto.walletAddress, dto.privateKey);
    return ApiResponseDto.build(result, 'Signature created successfully', 201, '/auth/sign');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['full'] })
  @ApiOkResponse({ type: LoginResponseEnvelope })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return ApiResponseDto.build(result, 'Logged in successfully', 200, '/auth/login');
  }
}