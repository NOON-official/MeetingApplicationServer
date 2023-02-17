const pool = require('../../repository/db');
const { teamDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 팀 매칭 실패에서 매칭중으로 되돌리기
module.exports = async (req, res) => {
  const { ourteamId } = req.body;

  if (!ourteamId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const success = await teamDB.revertFailTeam(conn, ourteamId);

    // 매칭실패한 팀 정보가 없는 경우
    if (success === false) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, responseMessage.ADMIN_NO_RESULT));
    } else if (success === true) {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, responseMessage.REVERT_FAIL_TEAM_SUCCESS, { success }));
    }
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
