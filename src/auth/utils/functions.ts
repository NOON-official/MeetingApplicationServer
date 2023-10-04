import * as fs from 'fs';
import * as crypto from 'crypto';

export function makeOrderId(): string {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let date = today.getDate();
  let time = today.getTime();
  let monthST: string;

  if (month < 10) {
    monthST = '0' + month;
  } else {
    monthST = String(month);
  }

  const result = year + '' + monthST + '' + date + '' + time;

  return result;
}

export function getCurrentDate(): string {
  let date = new Date();
  let str_year = date.getFullYear().toString();
  let year = str_year.substring(2, 4);

  let month = date.getMonth() + 1;
  let monthStr = month < 10 ? '0' + month.toString() : month.toString();

  let day = date.getDate();
  let dayStr = day < 10 ? '0' + day.toString() : day.toString();

  let hour = date.getHours();
  let hourStr = hour < 10 ? '0' + hour.toString() : hour.toString();

  let minites = date.getMinutes();
  let minitesStr = minites < 10 ? '0' + minites.toString() : minites.toString();

  let seconds = date.getSeconds();
  let secondsStr = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

  let vtime = year + monthStr + dayStr + hourStr + minitesStr + secondsStr;
  return vtime;
}

export function makeSignatureData(data: string) {
  var key_file = fs.readFileSync('./src/certificate/KCP_AUTH_AJOAD_PRIKEY.pem', 'utf-8').toString();
  var password = 'Noon20210701!';
  // 서명데이터생성
  return crypto.createSign('sha256').update(data).sign(
    {
      format: 'pem',
      key: key_file,
      passphrase: password,
    },
    'base64',
  );
}
