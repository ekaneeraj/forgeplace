import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<TPayload = undefined> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Users fetched successfully' })
  message: string;

  data: TPayload;

  @ApiProperty({ example: '2026-08-31T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/users' })
  path: string;

  static build<TPayload>(
    data: TPayload,
    message: string,
    statusCode = 200,
    path = '',
  ): ApiResponseDto<TPayload> {
    return {
      statusCode,
      success: statusCode >= 200 && statusCode < 300,
      message,
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  }
}