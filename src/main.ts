import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<string>('SERVER_PORT');
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  const clientUrl = configService.get<string>('CLIENT_URL');
  const swaggerConfig = new DocumentBuilder()
    .setTitle('미팅학개론')
    .setDescription('미팅학개론 ver.2 API 명세서')
    .setVersion('2.0')
    .addServer('/api')
    .addTag('AUTH')
    .addTag('USER')
    .addTag('TEAM')
    .addTag('ORDER')
    .addTag('COUPON')
    .addTag('INVITATION')
    .addTag('MATCHING')
    .addTag('ADMIN')
    .addBearerAuth()
    .addCookieAuth('refresh')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  app.use(cookieParser(cookieSecret));
  app.enableCors({ credentials: true, origin: clientUrl });

  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();
