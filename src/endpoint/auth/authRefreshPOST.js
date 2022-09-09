const jwtHandlers = require('../../lib/jwtHandlers');
const jwt = require('jsonwebtoken');
const pool = require('../../repository/db');
const { userDB, teamDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../../constants/jwt');

module.exports = async (req, res) => {
  // Access Token과 Refresh Token 추출
  let accessToken = null;
  if (!!req.headers.authorization) {
    accessToken = req.headers.authorization.split('Bearer ')[1];
  }
  const grantType = req.body.grant_type;
  const refreshToken = req.body.refresh_token;
  const userId = req.body.userId;

  if (!accessToken || !refreshToken) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EMPTY));
  }

  if (grantType != 'refresh_token') {
    return res
      .status(statusCode.UNAUTHORIZED)
      .send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_GRANT_TYPE));
  }

  if (!userId) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_USER_ID));
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const decoded = jwt.decode(accessToken);

    // 디코딩 결과가 없는 경우
    if (decoded === null) {
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
    }

    // Access Token 해독 및 인증
    const decodedAccessToken = jwtHandlers.accessToken.verify(accessToken);
    const decodedRefreshToken = await jwtHandlers.refreshToken.verify(refreshToken, userId);

    // 토큰이 유효하지 않은 경우
    if (decodedAccessToken === TOKEN_INVALID || decodedRefreshToken === TOKEN_INVALID) {
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
    }

    // 토큰 재발급 과정
    if (decodedAccessToken === TOKEN_EXPIRED) {
      // 1. Access Token 만료 & Refresh Token 만료 => 새로 로그인
      if (decodedRefreshToken === TOKEN_EXPIRED) {
        return res
          .status(statusCode.UNAUTHORIZED)
          .send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
      }
      // 2. Access Token 만료 & Refresh Token 유효 => Access Token 재발급
      else {
        let user = await userDB.getUserById(conn, decoded.id);

        const newAccessToken = jwtHandlers.accessToken.sign(user);

        const isMatching = await teamDB.getIsMatchingByUserId(conn, decoded.id);

        user.isMatching = isMatching;
        user.accessToken = newAccessToken;
        user.refreshToken = refreshToken;

        // 새로 발급한 Access Token과 함께 유저 정보를 반환
        return res
          .status(statusCode.OK)
          .send(util.success(statusCode.OK, responseMessage.REFRESH_TOKEN_SUCCESS, { user }));
      }
    }
    // 3. Access Token 유효 => 재발급 필요X
    else {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_EXPIRED_TOKEN));
    }
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
