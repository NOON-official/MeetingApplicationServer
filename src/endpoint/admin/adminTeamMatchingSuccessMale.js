const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const { toArrayOfString, toArrayOfNumber } = require('../../lib/convertArrayToString');
const pool = require('../../repository/db');
const { teamDB } = require('../../repository');

// 매칭 완료된 남자팀 정보 전체 조회
module.exports = async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    let maleTeam = await teamDB.getSuccessMaleTeamByAdmin(conn, 1); // 남자

    // 결과가 없는 경우
    if (!maleTeam || maleTeam.length === 0) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ADMIN_NO_RESULT));
    }

    maleTeam = maleTeam.map((t) => {
      let n = {}; // 반환할 객체를 저장
      const arrayCheckList = [
        'job',
        'university',
        'area',
        'day',
        'appearance',
        'mbti',
        'fashion',
        'role',
        'preferenceJob',
        'preferenceVibe',
      ];
      const stringCheckList = ['preferenceAge', 'preferenceHeight'];

      // 반환할 형태로 변환하기
      for (const [k, v] of Object.entries(t)) {
        if (arrayCheckList.includes(k)) {
          n[k] = toArrayOfNumber(v);
        } else if (stringCheckList.includes(k)) {
          n[k] = toArrayOfString(v);
        } else {
          n[k] = v;
        }
      }
      return n;
    });

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.GET_MATCHING_SUCCESS_MALE_TEAM_SUCCESS, {
        maleTeam,
      }),
    );
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
