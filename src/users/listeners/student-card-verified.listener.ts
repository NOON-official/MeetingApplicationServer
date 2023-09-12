import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { StudentCardVerifiedEvent } from '../events/student-card-verified.event';
import { StudentCardVerifiedContentConstant } from 'src/common/sms/constants/student-card-verified-content.constant';

@Injectable()
export class StudentCardVerifiedListener {
  // 학교 인증 승인된 유저에게 문자 보내기
  @OnEvent('student-card.verified', { async: true })
  async handleStudentCardVerifiedEvent(event: StudentCardVerifiedEvent) {
    const user = event.user;

    !user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        user.phone,
        StudentCardVerifiedContentConstant.CONTENT,
        StudentCardVerifiedContentConstant.SUBJECT,
      );
  }
}
