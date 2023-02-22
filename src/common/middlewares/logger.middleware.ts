import { Injectable, NestMiddleware } from '@nestjs/common';
import { LoggerService } from '../utils/logger-service.util';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const loggerService = new LoggerService('HTTP REQUEST');

    const { method, originalUrl, headers, query, body } = req;
    const userAgent = req.get('user-agent');

    // 응답이 끝나는 이벤트가 발생하면 로그 찍기
    res.on('finish', () => {
      const { statusCode, statusMessage } = res;

      // 서버 에러
      if (statusCode === 500) {
        loggerService.error(
          `[${method}] ${originalUrl} ${statusCode} ${statusMessage} \n ${userAgent} \n headers: ${headers}  \n query: ${query} \n body: ${body}`,
        );
      } else {
        loggerService.info(`[${method}] ${originalUrl} ${statusCode} ${statusMessage} ${userAgent}`);
      }
    });

    next();
  }
}
