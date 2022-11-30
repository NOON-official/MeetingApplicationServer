const pool = require('../../repository/db');
const { teamDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 매칭 그만두기
module.exports = async (req, res) => {
  const { ourteamId } = req.body;

  if (!ourteamId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const team = await teamDB.getOurteamByOurteamId(conn, ourteamId);
    if (!team) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    }

    // 가삭제 처리 (state = -1)
    await teamDB.updateTeamState(conn, ourteamId, -1);

    return res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.QUIT_APPLY_SUCCESS, { success: true }));
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
