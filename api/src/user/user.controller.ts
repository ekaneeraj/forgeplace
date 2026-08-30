import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ApiResponseDto } from '../common/dto/api-response.dto.js';
import {
  MeResponseEnvelope,
  UserListResponseEnvelope,
  UserResponseEnvelope,
} from './dto/user-response.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserService } from './user.service.js';

@ApiTags('users')
@SerializeOptions({ groups: ['public'] })
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @SerializeOptions({ groups: ['full'] })
  @ApiOkResponse({ type: MeResponseEnvelope })
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    const { walletAddress } = req.user;
    const user = await this.userService.findByWalletAddress(walletAddress);
    return ApiResponseDto.build(user, 'Current user fetched successfully', 200, '/users/me');
  }

  @Get()
  @ApiOkResponse({ type: UserListResponseEnvelope })
  async findAll() {
    const users = await this.userService.findAll();
    return ApiResponseDto.build(users, 'Users fetched successfully', 200, '/users');
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponseEnvelope })
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return ApiResponseDto.build(user, 'User fetched successfully', 200, `/users/${id}`);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserResponseEnvelope })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.userService.update(id, dto);
    return ApiResponseDto.build(user, 'User updated successfully', 200, `/users/${id}`);
  }
}