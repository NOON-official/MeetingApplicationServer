const pool = require('../../repository/db');
const { userDB } = require('../../repository');
const jwt = require('../../lib/jwtHandlers');

module.exports = async (kakaoUser) => {
  const { id: kakaoUid, properties, kakao_account: kakaoAccount } = kakaoUser;

  if (!kakaoUid || !properties.nickname) {
    return false;
  }

  let conn;

  try {
    conn = await pool.getConnection();

    // DB에 유저 생성
    let user = await userDB.saveUser(conn, kakaoUid, properties, kakaoAccount);

    // JWT 발급
    const accessToken = jwt.accessToken.sign(user);
    const refreshToken = jwt.refreshToken.sign();

    // 발급한 Refresh Token을 DB에 저장
    await userDB.saveRefreshToken(conn, refreshToken, user.id);

    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    user.isMatching = false;

    // 토큰과 함께 유저 정보를 반환
    return user;
  } catch (error) {
    console.log(error);
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release(); // 빌려온 connection 반환
  }
};
