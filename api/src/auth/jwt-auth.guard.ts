import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

export interface JwtPayload {
  walletAddress: string;
  sub?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    walletAddress: string;
  };
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = { walletAddress: string }>(
    err: unknown,
    user: TUser,
    info: unknown,
  ): TUser {
    if (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      const missingToken =
        err instanceof Error && err.message === 'No auth token';
      throw new UnauthorizedException(
        missingToken ? 'Missing bearer token' : 'Invalid or expired token',
      );
    }
    if (!user) {
      const missingToken =
        info instanceof Error && info.message === 'No auth token';
      throw new UnauthorizedException(
        missingToken ? 'Missing bearer token' : 'Invalid or expired token',
      );
    }
    return user;
  }
}