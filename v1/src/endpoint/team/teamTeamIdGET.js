const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { teamDB } = require('../../repository');

// 팀의 매칭 신청 정보 조회
module.exports = async (req, res) => {
  const { teamId } = req.params;

  if (!teamId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  let conn;

  try {
    conn = await pool.getConnection();

    const userId = await teamDB.getUserIdByOurteamId(conn, teamId);
    const ourteamId = await teamDB.getOurteamIdByUserId(conn, req.user.id); // 로그인한 유저의 우리팀 id
    const partnerTeamId = await teamDB.getPartnerTeamIdByOurteamId(conn, ourteamId); // 로그인한 유저의 상대팀 id

    // 본인의 팀 id가 아니면서, 상대팀 id도 아닌 경우
    if (userId !== req.user.id && partnerTeamId != teamId) {
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_USER));
    }

    const team = await teamDB.getTeamInfoByTeamId(conn, teamId);

    if (!team) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_TEAM_APPLY_SUCCESS, team));
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
