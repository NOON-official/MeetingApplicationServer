const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { serviceDB } = require('../../repository');

module.exports = async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection(); // pool에서 connction 빌려오기

    const waitingTeam = await serviceDB.getWaitingTeam(conn); // query 결과값 저장

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.GET_TEAM_COUNT_SUCCESS, {
        waitingTeam,
      }),
    );
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release(); // 빌려온 connection 반환
  }
};
