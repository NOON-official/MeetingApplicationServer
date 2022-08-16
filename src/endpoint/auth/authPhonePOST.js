const pool = require('../../repository/db');
const { userDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 유저 핸드폰 번호 저장
module.exports = async (req, res) => {
  const { userId, phone } = req.body;

  if (!userId || !phone) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let conn;
  try {
    conn = await pool.getConnection(); // pool에서 connction 빌려오기

    // 유저가 없는 경우
    const user = await userDB.getUserById(conn, userId);
    if (!user) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
    }

    const result = await userDB.saveUserPhone(conn, userId, phone);

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, responseMessage.SAVE_USER_PHONE_SUCCESS, { success: result }));
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
