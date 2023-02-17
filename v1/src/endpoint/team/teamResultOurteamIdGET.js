const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { teamDB } = require('../../repository');

// 우리팀 매칭 결과 조회
module.exports = async (req, res) => {
  const { ourteamId } = req.params;

  if (!ourteamId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  let conn;

  try {
    conn = await pool.getConnection();

    const userId = await teamDB.getUserIdByOurteamId(conn, ourteamId);

    // 잘못된 유저 id인 경우
    if (userId !== req.user.id) {
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_USER));
    }

    const partnerTeamId = await teamDB.getPartnerTeamIdByOurteamId(conn, ourteamId);

    // 수락-수락 상태가 아닌 경우
    const currentMatchingStatus = await teamDB.getCurrentMatchingStatus(conn, ourteamId, partnerTeamId);

    if (currentMatchingStatus === -1) {
      return res.status(statusCode.BAD_REQUEST).send(util.success(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    }

    if (!(currentMatchingStatus.ourteamIsAccepted === 1 && currentMatchingStatus.partnerTeamIsAccepted === 1)) {
      return res.status(statusCode.BAD_REQUEST).send(util.success(statusCode.BAD_REQUEST, responseMessage.FORBIDDEN));
    }

    // 매칭 결과
    const matchingResult = await teamDB.getMatchingResultByTeamId(conn, partnerTeamId);

    if (!matchingResult) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_RESULT));
    }

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.GET_MATCHING_RESULT_SUCCESS, { matchingResult }));
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
