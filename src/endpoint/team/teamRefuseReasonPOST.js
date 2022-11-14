const pool = require('../../repository/db');
const { teamDB } = require('../../repository');
const { toString } = require('../../lib/convertArrayToString');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 매칭 거절 이유 보내기
module.exports = async (req, res) => {
  const { ourteamId, reason } = req.body;

  if (!ourteamId || !reason) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let id;
  let other;

  if (!reason.id || reason.id.length === 0) {
    id = null;
  } else {
    id = toString(reason.id);
  }

  if (!reason.other) {
    other = null;
  } else {
    other = reason.other;
  }

  const params = {
    ourteamId,
    id,
    other,
  };

  let conn;
  try {
    conn = await pool.getConnection();

    const team = await teamDB.getTeamInfoByTeamId(conn, ourteamId);
    if (!team) {
      return res.status(statusCode.BAD_REQUEST).send(util.success(statusCode.BAD_REQUEST, responseMessage.NO_APPLY));
    }

    await teamDB.saveTeamRefuseReason(conn, params);

    return res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.SAVE_REFUSE_REASON_SUCCESS, { success: true }));
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
