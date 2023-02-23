import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SigninMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { redirectUrl } = req.query;
    const { referer } = req.headers;

    let signinRedirectUrl: string;

    // 로그인 후 redirect될 URL 설정
    if (!!redirectUrl) {
      if (String(redirectUrl).endsWith('/')) {
        signinRedirectUrl = String(redirectUrl).slice(0, -1);
      } else {
        signinRedirectUrl = String(redirectUrl);
      }
    } else {
      if (String(referer).endsWith('/')) {
        signinRedirectUrl = String(referer).slice(0, -1);
      } else {
        signinRedirectUrl = String(referer);
      }
    }

    // 쿠키에 저장해둔 후 로그인 완료 시 해당 URL로 리다이렉트
    res.cookie('signinRedirectUrl', signinRedirectUrl, {
      httpOnly: true, // 브라우저에서 접근 불가능
      // secure: process.env.NODE_ENV === 'production' ? true : false, // https 환경에서만 접근 허용
      maxAge: 3 * 60 * 1000, // 3분
    });

    next();
  }
}
