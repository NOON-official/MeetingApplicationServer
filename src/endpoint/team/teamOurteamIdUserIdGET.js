const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { teamDB } = require('../../repository');

// 유저의 (매칭 진행중인) 우리팀 아이디 조회
module.exports = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  // 잘못된 유저 id인 경우
  if (userId != req.user.id) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_USER));
  }

  let conn;

  try {
    conn = await pool.getConnection();

    const ourteamId = await teamDB.getOurteamIdByUserId(conn, userId);

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.GET_OURTEAM_ID_SUCCESS, {
        ourteamId,
      }),
    );
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
