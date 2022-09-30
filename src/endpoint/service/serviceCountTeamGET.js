const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { teamDB } = require('../../repository');

module.exports = async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection(); // pool에서 connction 빌려오기

    let waitingTeam = await teamDB.getWaitingTeam(conn); // query 결과값 저장
    waitingTeam = waitingTeam + 150; // 임의 숫자 더하기

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
