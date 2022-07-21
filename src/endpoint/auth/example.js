const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const sql = require('../../repository/mysql');

module.exports = async (req, res) => {
  const { email } = req.body;

  // email이 빈칸인 경우
  if (!email)
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.BLANK_BOX));

  try {
    conn = await pool.getConnection(); // pool에서 connction 빌려오기

    const result = await sql.example(conn, email); // query 결과값 저장

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, {
        result,
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
