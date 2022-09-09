const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { userDB } = require('../../repository');

// 유저 정보 조회
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

    const user = await userDB.getUserInfoByUserId(conn, userId);

    // 유저가 존재하지 않는 경우
    if (!user) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
    }

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.GET_USER_SUCCESS, {
        user,
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
