import { Method } from 'axios';
import * as crypto from 'crypto';

export const getNaverCloudSignature = async (
  method: Method,
  url: string,
  timestamp: string,
  accessKey: string,
  secretKey: string,
) => {
  const message = [];
  const space = ' '; // one space
  const newLine = '\n'; // new line

  const hmac = crypto.createHmac('sha256', secretKey);
  const verificationUrl = url.split('https://sens.apigw.ntruss.com')[1];

  message.push(method);
  message.push(space);
  message.push(verificationUrl);
  message.push(newLine);
  message.push(timestamp);
  message.push(newLine);
  message.push(accessKey);

  const signature = hmac.update(message.join('')).digest('base64').toString();

  return signature;
};
