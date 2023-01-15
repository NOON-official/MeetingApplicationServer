const pool = require('../../repository/db');
const { teamDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 매칭 비활성화
module.exports = async (req, res) => {
  const { maleTeamId, femaleTeamId } = req.body;

  if (!maleTeamId || !femaleTeamId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const success = await teamDB.closeMatching(conn, maleTeamId, femaleTeamId);

    if (success === false) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, responseMessage.ADMIN_NO_RESULT));
    } else if (success === true) {
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.DELETE_MATCHING_SUCCESS, { success }));
    }
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
