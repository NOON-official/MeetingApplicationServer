const jwtHandlers = require('../lib/jwtHandlers');
const pool = require('../repository/db');
const { userDB } = require('../repository');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../constants/jwt');

const checkUser = async (req, res, next) => {
  // request cookie에 담긴 Access Token 추출
  const accessToken = req.signedCookies.access;

  // Access Token이 없는 경우
  if (!accessToken)
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_EMPTY));

  let conn;
  try {
    conn = await pool.getConnection();

    // 토큰 해독 및 인증
    const decodedToken = jwtHandlers.accessToken.verify(accessToken);
    // 토큰이 만료된 경우
    if (decodedToken === TOKEN_EXPIRED)
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, responseMessage.ACCESS_TOKEN_EXPIRED));
    //토큰이 유효하지 않은 경우
    if (decodedToken === TOKEN_INVALID)
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));

    // 해독된 토큰에 담긴 유저 id 추출
    const userId = decodedToken.id;

    if (!userId)
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));

    // 유저 id를 이용해 조회
    const user = await userDB.getUserById(conn, userId);

    if (!user) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));

    // 조회한 유저 객체를 req.user에 담아서 next()를 이용해 다음 middleware로 전달
    // 다음 middleware는 req.user에 담긴 유저 정보 활용 가능
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};

module.exports = { checkUser };
