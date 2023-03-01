import { LoggerService as LS } from '@nestjs/common';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';
import { utilities } from 'nest-winston';
import * as moment from 'moment-timezone';

export class LoggerService implements LS {
  private logger: winston.Logger;

  private env = process.env.NODE_ENV;
  private logDir = __dirname + '/../../../logs'; // 로그 저장 폴더 위치

  dailyOptions = (level: string) => {
    return {
      level,
      datePattern: 'YYYY-MM-DD',
      dirname: this.logDir + `/${level}`,
      filename: `%DATE%.${level}.log`,
      maxFiles: 30, // 30일치 저장
      zippedArchive: true, // 로그가 쌓이면 압축하여 관리
    };
  };

  constructor(service: string) {
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          // production 환경이라면 verbose, 개발환경이라면 모든 단계를 로그
          level: this.env === 'production' ? 'verbose' : 'silly',
          format:
            this.env === 'production'
              ? // production 환경은 자원을 아끼기 위해 simple 포맷 사용
                winston.format.simple()
              : winston.format.combine(
                  utilities.format.nestLike(service, {
                    colors: true,
                    prettyPrint: true, // nest에서 제공하는 옵션. 로그 가독성을 높여줌
                  }),
                ),
        }),

        // verbose, info, warn, error 로그는 파일로 관리
        new winstonDaily(this.dailyOptions('verbose')),
        new winstonDaily(this.dailyOptions('info')),
        new winstonDaily(this.dailyOptions('warn')),
        new winstonDaily(this.dailyOptions('error')),
      ],
    });
  }

  log(message: string) {
    this.logger.log({
      level: 'info',
      timestamp: moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
      message,
    });
  }
  info(message: string) {
    this.logger.info({ timestamp: moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'), message });
  }
  error(message: string) {
    this.logger.error({ timestamp: moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'), message });
  }
  warn(message: string) {
    this.logger.warning({ timestamp: moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'), message });
  }
  debug(message: string) {
    this.logger.debug({ timestamp: moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'), message });
  }
  verbose(message: string) {
    this.logger.verbose({ timestamp: moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'), message });
  }
}
