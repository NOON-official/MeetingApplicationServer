import { AdminGetOurteamRefusedTeamDto } from './dtos/admin-get-ourteam-refused-team.dto';
import { CreateCouponDto } from './../coupons/dtos/create-coupon.dto';
import { AdminGetInvitationSuccessUserDto } from './dtos/admin-get-invitation-success-user.dto';
import { AdminGetMatchingDto } from './dtos/admin-get-matching.dto';
import { MatchingStatus } from './../matchings/interfaces/matching-status.enum';
import { AdminGetAppliedTeamDto, AdminGetTeamDto } from './dtos/admin-get-team.dto';
import { AdminService } from './admin.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminGetUserDto, AdminGetUserWithStudentCardDto } from './dtos/admin-get-user.dto';

@ApiTags('ADMIN')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Roles('admin')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '전체 팀 조회 (📌is updating)',
    description: '관리자페이지 내 사용',
  })
  @ApiQuery({ name: 'gender', enum: TeamGender })
  @ApiOkResponse({
    schema: {
      example: {
        teams: [
          {
            teamId: 1,
            nickname: '미팅이',
            userId: 1,
            kakaoId: '카카오 아이디',
            teamName: '한솔이와 친구들',
            intro: '안녕하세요',
            memberCount: 2,
            memberCounts: [3],
            phone: '01012345678',
            age: 23,
            prefAge: [23, 27],
            areas: [1, 3],
            universities: [1, 4, 100],
            drink: 5,
            applidAt: '2023-01-20T21:37:26.886Z',
          },
        ],
      },
    },
  })
  @Get('teams')
  getAdminTeams(@Query('gender') gender: TeamGender): Promise<{ teams: AdminGetTeamDto[] }> {
    return this.adminService.getAdminTeams(gender);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '삭제 적용',
    description: '관리자페이지 내 사용 \n\n 해당 팀 soft delete 처리',
  })
  @Delete('teams/:teamId')
  deleteAdminTeamsTeamId(@Param('teamId') teamId: number): Promise<void> {
    return this.adminService.deleteTeamByTeamId(teamId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '신청한/신청받은 팀 조회 (📌is updating)',
    description: '관리자페이지 내 사용',
  })
  @ApiOkResponse({})
  @Get('matchings/applied')
  getAdminMatchingsApplied(): Promise<{ appliedandreceiveds: AdminGetAppliedTeamDto[] }> {
    return this.adminService.getAdminMatchingsApplied();
  }

  @ApiOperation({
    summary: '매칭 완료 팀 조회 (📌is updating)',
    description: '',
  })
  @ApiOkResponse({
    schema: {
      example: {
        matchings: [
          {
            matchingId: 1,
            maleTeamId: 1,
            maleTeamNickname: '미팅이1',
            maleTeamPhone: '01012345678',
            femaleTeamId: 2,
            femaleTeamNickname: '미팅이2',
            femaleTeamPhone: '01012345678',
            matchedAt: '2023-01-20T21:37:26.886Z',
            chatIsCreated: false,
          },
        ],
      },
    },
  })
  @Get('matchings/succeeded')
  getAdminMatchingsSucceeded(): Promise<{ matchings: AdminGetMatchingDto[] }> {
    return this.adminService.getAdminMatchingsSucceeded();
  }

  @ApiOperation({
    summary: '유저 전체 조회 (📌is updating)',
    description: '관리자 페이지 - 전체 회원',
  })
  @ApiOkResponse({
    schema: {
      example: {
        users: [
          {
            userId: 1,
            nickname: '미팅이1',
            birth: 1996,
            university: '한국외국어대학교',
            gender: '남자',
            phone: '01012345678',
            createdAt: '2023-01-2023-01-20T21:37:26.886Z',
            referralId: 'LD4GSTO3',
            approval: 1,
            isVerified: 1,
            ticketCount: 5,
            discount50CouponCount: 1,
            freeCouponCount: 0,
            userInvitationCount: 1,
          },
          {
            userId: 2,
            nickname: '미팅이2',
            birth: 1998,
            university: '경희대학교',
            gender: '여자',
            phone: '01012345678',
            createdAt: '2023-01-2023-01-20T21:37:26.886Z',
            referralId: 'LD4GSTO3',
            approval: 1,
            isVerified: 1,
            ticketCount: 5,
            discount50CouponCount: 1,
            freeCouponCount: 0,
            userInvitationCount: 1,
          },
        ],
      },
    },
  })
  @Get('users')
  getAdminUsers(): Promise<{ users: AdminGetUserDto[] }> {
    return this.adminService.getAllUsers();
  }

  @ApiOperation({
    summary: '팅 지급하기 (📌is updating)',
    description: 'tingCount 수만큼 유저 팅 지급',
  })
  @ApiOkResponse({ description: 'OK' })
  @Post('users/:userId/tings/:tingCount')
  postAdminUsersUserIdTingsTingCount(
    @Param('userId') userId: number,
    @Param('tingCount') tingCount: number,
  ): Promise<void> {
    return this.adminService.updateTingsByUserIdAndTingCount(userId, tingCount);
  }

  @ApiOperation({
    summary: '팅 삭제하기 (📌is updating)',
    description: 'tingCount 수만큼 유저 팅 차감',
  })
  @ApiOkResponse({ description: 'OK' })
  @Delete('users/:userId/tings/:tingCount')
  deleteAdminUsersUserIdTingsTingCount(
    @Param('userId') userId: number,
    @Param('tingCount') tingCount: number,
  ): Promise<void> {
    return this.adminService.deleteTingsByUserIdAndTingCount(userId, tingCount);
  }

  @ApiOperation({
    summary: '현재 신청팀 수 조회',
    description: '매칭 실패 횟수 3회 미만인 팀 포함',
  })
  @ApiOkResponse({
    schema: {
      example: {
        '2vs2': {
          male: 8,
          female: 6,
        },
        '3vs3': {
          male: 4,
          female: 5,
        },
        '4vs4': {
          male: 4,
          female: 5,
        },
      },
    },
  })
  @Get('teams/count')
  async getAdminTeamsCount(): Promise<{
    '2vs2': { male: number; female: number };
    '3vs3': { male: number; female: number };
    '4vs4': { male: number; female: number };
  }> {
    return this.adminService.getAdminTeamCount();
  }

  @ApiOperation({
    summary: '학생증 인증 신청 내역 조회 (📌is updating)',
    description: '관리자 페이지 내 사용',
  })
  @ApiOkResponse({
    schema: {
      example: {
        users: [
          {
            userId: 1,
            nickname: '미팅이1',
            birth: 1996,
            university: '한국외국어대학교',
            gender: '남자',
            studentCardUrl: 'https://www.meeting.me/image/3adsasd',
            approval: null,
          },
          {
            userId: 2,
            nickname: '미팅이2',
            birth: 1998,
            university: '경희대학교',
            gender: '여자',
            studentCardUrl: 'https://www.meeting.me/image/3adsasd',
            approval: null,
          },
        ],
      },
    },
  })
  @Get('users/student-card')
  getAdminUsersStudentCard(): Promise<{ users: AdminGetUserWithStudentCardDto[] }> {
    return this.adminService.getAllUsersWithStudentCard();
  }

  @ApiOperation({
    summary: '유저 학교 인증 승인하기 (📌is updating)',
    description: '관리자 페이지 내 사용',
  })
  @ApiOkResponse({ description: 'OK' })
  @Put('users/:userId/student-card/verify')
  putAdminUsersUserIdStudentCardVerify(@Param('userId') userId: number): Promise<void> {
    return this.adminService.updateUserVerify(userId);
  }

  @ApiOperation({
    summary: '유저 학교 인증 거절하기 (📌is updating)',
    description: '관리자 페이지 내 사용',
  })
  @ApiOkResponse({ description: 'OK' })
  @Put('users/:userId/student-card/decline')
  putAdminUsersUserIdStudentCardDecline(@Param('userId') userId: number): Promise<void> {
    return this.adminService.updateUserDeny(userId);
  }

  @ApiOperation({
    summary: '티켓 전부 팅으로 교환',
    description: '일회용',
  })
  @ApiOkResponse({ description: 'OK' })
  @Post('users/ting')
  postAdminChangeTicketToTing(): Promise<void> {
    return this.adminService.changeTicketToTing();
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '신청자 조회',
  //   description:
  //     '관리자페이지 내 사용 \n\n * APPLIED = 신청자 \n\n * MATCHED = 수락/거절 대기자 \n\n * FAILED = 매칭 실패 회원 \n\n * PARTNER_TEAM_REFUSED = 거절 당한 회원 \n\n 아직 매칭되지 않은 경우: partnerTeamId=null, matchedAt=null \n\n 매칭실패하지 않은 경우: failedAt=null \n\n 거절당하지 않은 경우: refusedAt=null',
  // })
  // @ApiQuery({
  //   name: 'status',
  //   enum: [MatchingStatus.APPLIED, MatchingStatus.MATCHED, MatchingStatus.FAILED, MatchingStatus.PARTNER_TEAM_REFUSED],
  // })
  // @ApiQuery({ name: 'membercount', enum: ['2', '3'] })
  // @ApiQuery({ name: 'gender', enum: TeamGender })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       teams: [
  //         {
  //           teamId: 2,
  //           matchingCount: 0,
  //           nickname: '미팅이',
  //           intro: '안녕하세요',
  //           memberCount: 2,
  //           phone: '01012345678',
  //           averageAge: 23,
  //           prefAge: [23, 27],
  //           areas: [1, 3],
  //           universities: [1, 42, 345],
  //           prefSameUniversity: true,
  //           drink: 5,
  //           partnerTeamId: 2,
  //           appliedAt: '2023-01-20T21:37:26.886Z',
  //           matchedAt: '2023-01-20T21:37:26.886Z',
  //           failedAt: '2023-01-20T21:37:26.886Z',
  //           refusedAt: '2023-01-20T21:37:26.886Z',
  //           lastFailReason: 'Date',
  //         },
  //       ],
  //     },
  //   },
  // })
  // @Get('teams')
  // getAdminTeamsStatusMembercountGender(
  //   @Query('status')
  //   status:
  //     | MatchingStatus.APPLIED
  //     | MatchingStatus.MATCHED
  //     | MatchingStatus.FAILED
  //     | MatchingStatus.PARTNER_TEAM_REFUSED,
  //   @Query('membercount') membercount: '2' | '3',
  //   @Query('gender') gender: TeamGender,
  // ): Promise<{ teams: AdminGetTeamDto[] }> {
  //   return this.adminService.getTeamsByStatusAndMembercountAndGender(status, membercount, gender);
  // }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '매칭 거절 팀 및 거절 이유 조회',
  //   description: '관리자페이지 내 사용 \n\n 매칭 거절한 팀 및 거절 이유 조회',
  // })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       teams: [
  //         {
  //           teamId: 2,
  //           nickname: '미팅이',
  //           gender: '남',
  //           phone: '01012345678',
  //           matchingRefuseReason: '학교 / 자기소개서 / 내부 사정 / 그냥',
  //           refusedAt: '2023-01-20T21:37:26.886Z',
  //         },
  //       ],
  //     },
  //   },
  // })
  // @Get('teams/ourteam-refused')
  // getAdminTeamsOurteamRefused(): Promise<{ teams: AdminGetOurteamRefusedTeamDto[] }> {
  //   return this.adminService.getOurteamRefusedTeams();
  // }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '매칭 거절 이유 삭제',
  //   description: '관리자페이지 내 사용 \n\n 팀 ID에 해당하는 매칭 거절 이유 삭제',
  // })
  // @Delete('teams/ourteam-refused/:teamId')
  // deleteAdminTeamsOurteamRefusedTeamId(@Param('teamId') teamId: number): Promise<void> {
  //   return this.adminService.deleteOurteamRefusedTeamByTeamId(teamId);
  // }

  // @ApiOperation({
  //   summary: '친구초대 4명 달성 유저 조회',
  //   description: '커피쿠폰 미지급 상태인 유저만 조회 \n\n createdAt은 가장 마지막에 친구 초대한 일시',
  // })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       users: [
  //         {
  //           userId: 2,
  //           createdAt: '2023-01-20T21:37:26.886Z',
  //           nickname: '미팅이',
  //           phone: '01012345678',
  //           invitationSuccessCount: 3,
  //         },
  //       ],
  //     },
  //   },
  // })
  // @Get('invitations/users/success')
  // getInvitationsUsersSuccess(): Promise<{ users: AdminGetInvitationSuccessUserDto[] }> {
  //   return this.adminService.getInvitationSuccessUsers();
  // }

  // @ApiOperation({
  //   summary: '친구초대 4명 달성 유저 삭제',
  //   description: '관리자페이지 내 사용 \n\n 커피쿠폰 지급 완료 유저 삭제',
  // })
  // @ApiOkResponse({ description: 'OK' })
  // @Delete('invitations/users/:userId/success')
  // deleteInvitationsUsersSuccess(@Param('userId') userId: number): Promise<void> {
  //   return this.adminService.deleteInvitationSuccessByUserId(userId);
  // }

  // @ApiOperation({
  //   summary: '매칭 적용(매칭 알고리즘)',
  //   description: '관리자페이지 내 사용',
  // })
  // @ApiOkResponse({ description: 'OK' })
  // @Post('matchings')
  // postMatchings(): Promise<void> {
  //   return this.adminService.doMatching();
  // }

  // @ApiOperation({
  //   summary: '매칭 적용(수동 매칭)',
  //   description: '관리자페이지 내 사용 \n\n 남자팀과 여자팀을 1:1 수동 매칭',
  // })
  // @ApiOkResponse({ description: 'OK' })
  // @Post('matchings/:maleTeamId/:femaleTeamId')
  // postMatchingsMaleTeamIdFemaleTeamId(
  //   @Param('maleTeamId') maleTeamId: number,
  //   @Param('femaleTeamId') femaleTeamId: number,
  // ): Promise<void> {
  //   return this.adminService.createMatchingByMaleTeamIdAndFemaleTeamId(maleTeamId, femaleTeamId);
  // }

  // @ApiOperation({
  //   summary: '채팅방 생성 여부 저장 (📌is updating)',
  //   description: '매칭 완료자 조회 페이지에서 체크 박스 선택 시 해당 API 호출해서 저장해주시면 됩니다',
  // })
  // @ApiOkResponse({ description: 'OK' })
  // @Put('matchings/:matchingId/chat')
  // putMatchingsMatchingIdChat(@Param('matchingId') matchingId: number): Promise<void> {
  //   return this.adminService.saveChatCreatedAtByMatchingId(matchingId);
  // }

  // @ApiOperation({
  //   summary: '매칭 삭제하기',
  //   description: '매칭완료자 페이지에서 사용 \n\n 체크박스 선택된(채팅방 생성된) 매칭ID를 보내주시면 됩니다.',
  // })
  // @ApiOkResponse({ description: 'OK' })
  // @Delete('matchings/:matchingId')
  // deleteMatchingMatchingId(@Param('matchingId') matchingId: number): Promise<void> {
  //   return this.adminService.deleteMatchingByMatchingId(matchingId);
  // }

  // @ApiOperation({
  //   summary: '쿠폰 지급하기',
  // })
  // @ApiOkResponse({ description: 'OK' })
  // @Post('users/coupons/:userId')
  // postUsersCouponsUserId(@Param('userId') userId: number, @Body() createCouponDto: CreateCouponDto): Promise<void> {
  //   return this.adminService.createCouponWithUserId(userId, createCouponDto);
  // }
}
