import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { privateKeyToAccount } from 'viem/accounts';
import { recoverMessageAddress } from 'viem';
import { SIGNATURE_MESSAGE } from './constants.js';
import { LoginDto } from './dto/login.dto.js';
import { UserService } from '../user/user.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async sign(walletAddress: string, privateKey: string) {
    const timestamp = (new Date().getTime() / 1e3).toFixed(0);
    const message = `${SIGNATURE_MESSAGE}\n\nTimestamp: ${timestamp}`;

    const signature = await privateKeyToAccount(
      privateKey as `0x${string}`,
    ).signMessage({ message });

    return { signature, timestamp, walletAddress };
  }

  async login(dto: LoginDto) {
    const { walletAddress, signature, timestamp } = dto;

    if (!signature || !timestamp || !walletAddress) {
      throw new BadRequestException('Invalid signature params');
    }

    const timestampSeconds = Number(timestamp);
    if (!Number.isFinite(timestampSeconds)) {
      throw new BadRequestException('Invalid timestamp');
    }

    if (new Date().getTime() / 1e3 - 30 * 60 > timestampSeconds) {
      throw new BadRequestException('Signature expired');
    }

    const message = `${SIGNATURE_MESSAGE}\n\nTimestamp: ${timestamp}`;
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    let user = await this.userService.findByWalletAddress(walletAddress);

    if (!user) {
      user = await this.userService.create({ walletAddress });
    }

    const accessToken = await this.jwtService.signAsync({ walletAddress });
    const loginTimestamp = Math.floor(Date.now() / 1000);
    return {
      accessToken,
      user,
      timestamp: loginTimestamp,
    };
  }
}