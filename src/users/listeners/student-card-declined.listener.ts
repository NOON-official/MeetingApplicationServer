import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { StudentCardDeclinedEvent } from '../events/student-card-declined.event';
import { StudentCardDeclinedContentConstant } from 'src/common/sms/constants/student-card-declined-content.constant';

@Injectable()
export class StudentCardDeclinedListener {
  // 학교 인증 거절된 유저에게 문자 보내기
  @OnEvent('student-card.declined', { async: true })
  async handleStudentCardDeclinedEvent(event: StudentCardDeclinedEvent) {
    const user = event.user;

    !user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        user.phone,
        StudentCardDeclinedContentConstant.CONTENT,
        StudentCardDeclinedContentConstant.SUBJECT,
      );
  }
}
