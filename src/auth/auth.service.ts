import { InvitationsService } from './../invitations/invitations.service';
import { CouponsService } from './../coupons/coupons.service';
import { OrdersService } from './../orders/orders.service';
import { TeamsService } from './../teams/teams.service';
import { TicketsService } from 'src/tickets/tickets.service';
import { BadRequestException, HttpException } from '@nestjs/common/exceptions';
import { VerifyPhoneCodeDto } from './dtos/verify-phone-code.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist';
import { KakaoUser } from './interfaces/kakao-user.interface';
import { UsersService } from './../users/users.service';
import { CACHE_MANAGER, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { SavePhoneDto } from './dtos/save-phone.dto';
import { Cache } from 'cache-manager';
import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { SaveStudentCardDto } from './dtos/save-student-card.dto';
import * as fs from 'fs';
import { MakeUpHash } from './constants/make-up-hash';
import { getCurrentDate, makeOrderId, makeSignatureData } from './utils/functions';
import axios from 'axios';
import { decodeURIComponentCharset } from 'decode-uri-component-charset';
import { GetPassDto } from './dtos/get-pass.dto';
import { join } from 'path';

export class AuthService {
  constructor(
    private usersService: UsersService,
    private ticketsService: TicketsService,
    private teamsService: TeamsService,
    private ordersService: OrdersService,
    private couponsService: CouponsService,
    private invitationsService: InvitationsService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // refesh token, kakao access token 쿠키 옵션
  private readonly cookieOptions = {
    signed: true, // 암호화
    httpOnly: true, // 브라우저에서 접근 불가능
    // secure: process.env.NODE_ENV === 'production' ? true : false, // https 환경에서만 접근 허용
    maxAge: +this.configService.get<string>('COOKIE_MAX_AGE'), // msec
  };

  async IssueAccessToken(payload: JwtPayload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '2h',
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });

    return accessToken;
  }

  async IssueRefreshToken(payload: JwtPayload): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '14d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    return refreshToken;
  }

  async signInWithKakao(kakaoUser: KakaoUser, req: Request, res: Response): Promise<string> {
    let user = await this.usersService.getUserByKakaoUid(kakaoUser.kakaoUid);

    // 회원가입X
    if (!user) {
      // DB에 유저 생성
      user = await this.usersService.createUser(kakaoUser);
    }
    // 회원가입O
    else {
      // 유저 정보 업데이트
      if (!user.ageRange && kakaoUser.ageRange) {
        await this.usersService.updateUserAgeRange(user.id, kakaoUser.ageRange);
      }
      if (!user.gender && kakaoUser.gender) {
        await this.usersService.updateUserGender(user.id, kakaoUser.gender);
      }
    }

    // access token, refresh token 발급
    const payload: JwtPayload = { name: user.nickname, sub: user.id };

    const accessToken = await this.IssueAccessToken(payload);
    const refreshToken = await this.IssueRefreshToken(payload);

    // refresh token을 DB와 쿠키에저장
    await this.usersService.updateUserRefreshToken(user.id, refreshToken);
    res.cookie('refresh', refreshToken, this.cookieOptions);

    // 카카오 access token 저장
    res.cookie('kakaoAccessToken', kakaoUser.accessToken, this.cookieOptions);

    // client redirect url 설정
    const clientRedirectUrl = `${req?.cookies?.signinRedirectUrl}?access=${accessToken}`;

    return clientRedirectUrl;
  }

  async refreshToken(userId: number, refreshToken: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.getUserById(userId);

    // refresh token 검증
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      throw new ForbiddenException();
    }

    // 새로운 access token 발급
    const payload: JwtPayload = { name: user.nickname, sub: user.id };
    const accessToken = await this.IssueAccessToken(payload);

    return { accessToken };
  }

  async signOutWithKakao(userId: number, res: Response): Promise<void> {
    const clientId = this.configService.get<string>('KAKAO_REST_API_KEY');
    const signoutRedirectUri = this.configService.get<string>('KAKAO_SIGNOUT_REDIRECT_URI');
    const state = userId;

    const url = `https://kauth.kakao.com/oauth/logout?client_id=${clientId}&logout_redirect_uri=${signoutRedirectUri}&state=${state}`;

    // 쿠키에 저장된 refresh token, kakaoAccessToken 삭제
    res.clearCookie('refresh').clearCookie('kakaoAccessToken').status(200).send('OK');

    // 카카오톡 - 카카오 계정과 함께 로그아웃 API 호출
    await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data, error.response.status);
        }),
      ),
    );
  }

  // 카카오 로그아웃 Redirect 시 호출
  async signOut(req: Request): Promise<void> {
    const { state: userId } = req.query;

    // DB에 저장된 refresh token 삭제
    await this.usersService.deleteUserRefreshToken(Number(userId));
  }

  async deleteAccount(userId: number, req: Request, res: Response): Promise<void> {
    const kakaoAccessToken = req?.signedCookies?.kakaoAccessToken;

    const url = `https://kapi.kakao.com/v1/user/unlink`;

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    };

    // 카카오계정 연결끊기 요청
    await firstValueFrom(
      this.httpService.post(url, null, config).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data, error.response.status);
        }),
      ),
    );

    // 서비스 내 유저 삭제
    await this.usersService.deleteAccount(userId);

    // 해당 유저 관련 데이터 삭제 -- 매칭 정보 제외
    // 1) 이용권 삭제
    await this.ticketsService.deleteTicketsByUserId(userId);

    // 2) 팀 정보 삭제
    await this.teamsService.deleteTeamsByUserId(userId);

    // 3) 주문 정보 삭제
    await this.ordersService.deleteOrdersByUserId(userId);

    // 4) 쿠폰 삭제
    await this.couponsService.deleteCouponsByUserId(userId);

    // 5) 초대 정보 삭제 (초대자인 경우)
    await this.invitationsService.deleteInvitationsByUserId(userId);

    // 쿠키에 저장된 refresh token, kakaoAccessToken 삭제
    res.clearCookie('refresh').clearCookie('kakaoAccessToken').status(200).send('OK');
  }

  async postVerificationCode(savePhoneDto: SavePhoneDto): Promise<void> {
    // 1. 인증 코드 생성
    const receivePhoneNumber = savePhoneDto.phone;
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    // 2. 해당 전화번호와 1:1 저장
    await this.cacheManager.set(receivePhoneNumber, code); // 제한시간 3분

    // 3. 문자로 인증 코드 발송
    const content = `[미팅학개론] 인증번호 [${code}]를 입력해주세요.`;

    await postNaverCloudSMS(SmsType.SMS, ContentType.COMM, receivePhoneNumber, content);
  }

  async verifyCodeAndSavePhone(userId: number, verifyPhoneCodeDto: VerifyPhoneCodeDto): Promise<void> {
    const phone = verifyPhoneCodeDto.phone;
    const receivedCode = verifyPhoneCodeDto.code;

    const savedCode = await this.cacheManager.get(phone);

    // 저장된 인증 코드가 없는 경우(인증 시간이 만료된 경우)
    if (!savedCode) {
      throw new NotFoundException('verification timeout');
    }

    // 입력받은 인증 코드와 저장된 인증 코드 비교
    if (receivedCode !== savedCode) {
      throw new BadRequestException('invalid verification code');
    }

    // 저장된 인증 코드 삭제 및 DB에 핸드폰번호 저장
    await this.cacheManager.del(phone);

    return await this.usersService.updateUserPhone(userId, { phone });
  }

  async postAuthStudentCard(userId: number, saveStudentCardDto: SaveStudentCardDto): Promise<void> {
    const result = await this.usersService.getMyInfoByUserId(userId);

    if (result.nickname === null) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    } else {
      this.usersService.updateStudentCard(userId, saveStudentCardDto);
    }
  }

  async makeUpHash(userId: number): Promise<{
    res_cd: string;
    res_msg: string;
    site_cd: string;
    ordr_idxx: string;
    req_tx: string;
    cert_method: string;
    up_hash: string;
    cert_otp_use: string;
    web_siteid_hashYN: string;
    web_siteid: string;
    cert_enc_use_ext: string;
    kcp_merchant_time: string;
    kcp_cert_lib_ver: string;
    param_opt_1: number;
  }> {
    const kcp_cert_info = fs
      .readFileSync(join(__dirname, '../../src/certificate/KCP_AUTH_AJOAD_CERT.pem'), 'utf-8')
      .toString()
      .split('\n')
      .join('');
    const { CT_TYPE, SITE_CD, TAX_NO, WEB_SITEID, WEB_SITE_HASHYN } = MakeUpHash;
    const ordr_idxx = makeOrderId();
    const make_req_dt = getCurrentDate();
    const hash_data = SITE_CD + '^' + CT_TYPE + '^' + TAX_NO + '^' + make_req_dt; //up_hash 생성 서명 데이터
    const kcp_sign_data = makeSignatureData(hash_data); //서명 데이터(무결성 검증)

    // up_hash 생성 REQ DATA
    const req_data = {
      site_cd: SITE_CD,
      kcp_cert_info: kcp_cert_info,
      ct_type: CT_TYPE,
      ordr_idxx: ordr_idxx,
      web_siteid: WEB_SITEID,
      tax_no: TAX_NO,
      make_req_dt: make_req_dt,
      kcp_sign_data: kcp_sign_data,
    };
    const res_data = await axios.post('https://spl.kcp.co.kr/std/certpass', req_data);
    return {
      res_cd: res_data.data.res_cd,
      res_msg: res_data.data.res_msg,
      site_cd: SITE_CD,
      ordr_idxx,
      req_tx: 'CERT',
      cert_method: '01',
      up_hash: res_data.data.up_hash,
      cert_otp_use: 'Y',
      web_siteid_hashYN: WEB_SITE_HASHYN,
      web_siteid: WEB_SITEID,
      cert_enc_use_ext: 'Y',
      kcp_merchant_time: res_data.data.kcp_merchant_time,
      kcp_cert_lib_ver: res_data.data.kcp_cert_lib_ver,
      param_opt_1: userId,
    };
  }

  async saveUserWithPass(req: Request, res: Response) {
    const target_URL = 'https://spl.kcp.co.kr/std/certpass'; // 운영계
    const kcp_cert_info = fs
      .readFileSync(join(__dirname, '../../src/certificate/KCP_AUTH_AJOAD_CERT.pem'), 'utf-8')
      .toString()
      .split('\n')
      .join('');
    const site_cd = req.body.site_cd;
    const cert_no = req.body.cert_no;
    const dn_hash = req.body.dn_hash;
    const userId = req.body.param_opt_1;
    let ct_type = 'CHK';

    const dnhash_data = site_cd + '^' + ct_type + '^' + cert_no + '^' + dn_hash; //dn_hash 검증 서명 데이터
    let kcp_sign_data = makeSignatureData(dnhash_data); //서명 데이터(무결성 검증)

    const req_data_1 = {
      kcp_cert_info: kcp_cert_info,
      site_cd: site_cd,
      ordr_idxx: req.body.ordr_idxx,
      cert_no: cert_no,
      dn_hash: dn_hash,
      ct_type: ct_type,
      kcp_sign_data: kcp_sign_data,
    };

    const me = await axios.post(target_URL, req_data_1);
    const dn_res_cd = me.data.res_cd;

    ct_type = 'DEC';

    const decrypt_data = site_cd + '^' + ct_type + '^' + cert_no; //데이터 복호화 검증 서명 데이터
    kcp_sign_data = makeSignatureData(decrypt_data); //서명 데이터(무결성 검증)

    const req_data_2 = {
      kcp_cert_info: kcp_cert_info,
      site_cd: site_cd,
      ordr_idxx: req.body.ordr_idxx,
      cert_no: cert_no,
      ct_type: ct_type,
      enc_cert_Data: req.body.enc_cert_data2,
      kcp_sign_data: kcp_sign_data,
    };

    //dn _hash 검증데이터가 정상일 때, 복호화 요청 함
    if (dn_res_cd === '0000') {
      const result = await axios.post(target_URL, req_data_2);
      // API RES
      const data: GetPassDto = result.data;
      const { res_cd, res_msg, user_name, phone_no, birth_day, sex_code } = data;
      const birth = Number(birth_day.slice(0, 4));
      const gender = sex_code === '01' ? 'male' : 'female';
      if (res_cd === '0000') {
        await this.usersService.updateUserInfo(userId, { nickname: user_name, birth, gender, phone: phone_no });
      } else {
        throw new BadRequestException(`Error: ${res_msg}`);
      }
    } else {
      throw new BadRequestException('dn_hash 변조 위험있음');
    }
  }
}
