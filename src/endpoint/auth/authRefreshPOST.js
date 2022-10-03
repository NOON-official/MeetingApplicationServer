const jwtHandlers = require('../../lib/jwtHandlers');
const jwt = require('jsonwebtoken');
const pool = require('../../repository/db');
const { userDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../../constants/jwt');

// 토큰 재발급
module.exports = async (req, res) => {
  // Access Token과 Refresh Token 추출
  const accessToken = req.signedCookies.access;
  const grantType = req.body.grant_type;
  const refreshToken = req.signedCookies.refresh;
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

    // 잘못된 유저 id인 경유
    if (decoded.id != userId) {
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_USER));
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

        // 기존의 access 토큰을 지운 후 재발급한 토큰을 cookie에 저장
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 14); // 14일

        res.clearCookie('access');

        // access token
        res.cookie('access', newAccessToken, {
          expires: expiryDate,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false, // https로만 쿠키 통신 가능
          signed: true,
        });

        // 유저 정보를 반환
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
