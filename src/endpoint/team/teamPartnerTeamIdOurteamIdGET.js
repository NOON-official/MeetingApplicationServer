const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { teamDB } = require('../../repository');

// 우리팀의 상대팀 아이디 조회
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

    // 매칭 신청 정보가 없는 경우
    const ourteam = await teamDB.getOurteamByOurteamId(conn, ourteamId);
    if (!ourteam) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    }

    // 상대팀 정보가 없는 경우
    const partnerTeamId = await teamDB.getPartnerTeamIdByOurteamId(conn, ourteamId);
    if (partnerTeamId === -1) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_PARTNER_TEAM));
    }

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.GET_PARTNER_TEAM_ID_SUCCESS, { partnerTeamId }));
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
