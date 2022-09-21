const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { userDB } = require('../../repository');

module.exports = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  // 로그인한 유저 id와 로그아웃하려는 유저 id가 다른 경우
  if (userId != req.user.id) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_USER));
  }

  let conn;

  try {
    conn = await pool.getConnection();

    const success = await userDB.signoutUserByUserId(conn, userId);

    if (success === true) {
      res.clearCookie('access');
      res.clearCookie('refresh');

      res.status(statusCode.OK).send(
        util.success(statusCode.OK, responseMessage.SIGNOUT_USER_SUCCESS, {
          success,
        }),
      );
    }
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
