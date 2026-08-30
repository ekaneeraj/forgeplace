import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

interface ErrorResponse {
  httpStatus: number;
  message: string;
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const { httpStatus, message, error } = this.resolveException(exception);

    const responseBody = {
      statusCode: httpStatus,
      message,
      ...(error ? { error } : {}),
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private resolveException(exception: unknown): ErrorResponse {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { httpStatus: status, message: response, error: exception.name };
      }

      if (this.isObject(response)) {
        const message = response['message'] as string | undefined;
        const error = response['error'] as string | undefined;

        if (Array.isArray(message)) {
          return { httpStatus: status, message: message.join(', '), error };
        }

        return {
          httpStatus: status,
          message: message ?? exception.message,
          error: error ?? exception.name,
        };
      }
    }

    if (exception instanceof Error) {
      return {
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        error: exception.name,
      };
    }

    return {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Sorry we are experiencing technical problems',
      error: 'InternalServerError',
    };
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}