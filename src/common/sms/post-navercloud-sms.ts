import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ContentType } from './enums/content-type.enum';
import { SmsType } from './enums/sms-type.enum';
import { getNaverCloudSignature } from './get-navercloud-signature';
import { LoggerService } from '../utils/logger-service.util';

export const postNaverCloudSMS = async (
  smsType: SmsType,
  contentType: ContentType,
  receivePhoneNumber: string,
  content: string,
  subject?: string,
) => {
  const loggerService = new LoggerService('SMS');

  const configService = new ConfigService();
  const httpService = new HttpService();

  const accessKey = configService.get<string>('NAVERCLOUD_ACCESS_KEY');
  const secretKey = configService.get<string>('NAVERCLOUD_SECRET_KEY');
  const serviceId = configService.get<string>('NAVERCLOUD_SENS_SERVICE_ID');
  const sendPhoneNumber = configService.get<string>('SEND_MESSAGE_PHONE_NUMBER');

  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`;
  const timestamp = Date.now().toString();

  const requestConfig = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-iam-access-key': accessKey,
      'x-ncp-apigw-timestamp': timestamp,
      'x-ncp-apigw-signature-v2': await getNaverCloudSignature('POST', url, timestamp, accessKey, secretKey),
    },
  };

  const requestData = {
    type: smsType,
    contentType, // 일반 메시지
    countryCode: '82', // 국가 번호
    from: sendPhoneNumber, // 발신 번호
    subject,
    content, // 문자 내용
    messages: [
      {
        to: receivePhoneNumber, // 수신 번호
      },
    ],
  };

  if (!!receivePhoneNumber) {
    await firstValueFrom(
      httpService.post(url, requestData, requestConfig).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data, error.response.status);
        }),
      ),
    );

    loggerService.verbose(`[수신 번호] ${receivePhoneNumber} [문자 내용] ${content}`);
  }
};
