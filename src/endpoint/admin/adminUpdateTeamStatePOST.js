const pool = require('../../repository/db');
const { teamDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 수락/거절 적용하기
module.exports = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const bothAcceptedTeamId = await teamDB.getTeamIdByStateAndPageNum(conn, 3, 6); // 둘 다 수락한 경우
    const partnerTeamNotRespondedTeamId = await teamDB.getTeamIdByStateAndPageNum(conn, 2, 6); // 상대팀 무응답인 경우
    const ourteamNotRespondedTeamId = await teamDB.getTeamIdByStateAndPageNum(conn, 2, 5); // 본인팀 무응답인 경우
    const tmpDeletedTeamId = await teamDB.getTeamIdByState(conn, -1); // 가삭제인 경우

    bothAcceptedTeamId &&
      bothAcceptedTeamId.forEach(async (i) => {
        await teamDB.updateTeamStateAndPageNum(conn, i, 3, 7);
      });

    partnerTeamNotRespondedTeamId &&
      partnerTeamNotRespondedTeamId.forEach(async (i) => {
        await teamDB.updateTeamStateAndPageNum(conn, i, 4, 9);
      });

    ourteamNotRespondedTeamId &&
      ourteamNotRespondedTeamId.forEach(async (i) => {
        await teamDB.updateTeamStateAndPageNum(conn, i, 4, 9);
      });

    tmpDeletedTeamId &&
      tmpDeletedTeamId.forEach(async (i) => {
        await teamDB.deleteTeam(conn, i);
      });

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_TEAM_SUCCESS, { success: true }));
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
