const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const checkAdmin = async (req, res, next) => {
  // checkUser에서 넘어온 user 객체가 없는 경우
  if (!req.user) {
    return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
  }

  // let conn;
  try {
    // conn = await pool.getConnection();

    // 추후 필요시 kakaouid 체크

    // isAdmin이 올바르지 않은 값인 경우
    if (req.user.isAdmin !== 0 && req.user.isAdmin !== 1)
      return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));

    // 관리자가 아니면
    if (req.user.isAdmin !== 1)
      return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));

    next();
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    // conn.release();
  }
};

module.exports = { checkAdmin };
