import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

/** §5.2 — errors are RFC 7807 problem+json, not ad-hoc shapes. */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const detail =
      typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object' && 'message' in payload
          ? String((payload as { message: unknown }).message)
          : 'An unexpected error occurred.';

    void reply.status(status).type('application/problem+json').send({
      type: `https://httpstatuses.io/${status}`,
      title: HttpStatus[status] ?? 'Error',
      status,
      detail,
      instance: req.url,
      requestId: req.id,
    });
  }
}
