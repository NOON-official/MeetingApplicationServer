const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { teamDB } = require('../../repository');

// 우리팀 매칭 상태 조회
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

    const matchingStatus = await teamDB.getOurteamStatusByOurteamId(conn, ourteamId);

    if (matchingStatus !== 0 && matchingStatus !== 1 && matchingStatus !== 2) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    }

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.GET_TEAM_MATCHING_STATUS_SUCCESS, { matchingStatus }));
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};