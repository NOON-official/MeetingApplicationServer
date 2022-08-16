const jwt = require('jsonwebtoken');
const pool = require('../repository/db');
const { userDB } = require('../repository');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../constants/jwt');

// JWT 옵션 설정
const secretKey = process.env.JWT_SECRET;
const accessTokenOptions = {
  algorithm: 'HS256',
  expiresIn: 30 * 60, // Access Token 기한: 30분 (초 단위)
  issuer: 'meetinghakgaeron',
};

const accessToken = {
  // Access Token 발급
  sign(user) {
    const payload = {
      id: user.id,
      kakaoUid: user.kakaoUid,
      name: user.nickname,
    };

    const result = jwt.sign(payload, secretKey, accessTokenOptions);

    return result;
  },

  // Access Token 검증
  verify(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (err) {
      if (err.message === 'jwt expired') {
        console.log('expired access token');
        return TOKEN_EXPIRED;
      } else if (err.message === 'invalid token') {
        console.log('invalid access token 1');
        return TOKEN_INVALID;
      } else {
        console.log('invalid access token 2');
        return TOKEN_INVALID;
      }
    }
    // 해독된 상태의 JWT 반환
    return decoded;
  },
};

const refreshTokenOptions = {
  algorithm: 'HS256',
  expiresIn: '14d', // Refresh Token 기한
  issuer: 'meetinghakgaeron',
};

const refreshToken = {
  // Refresh Token 발급
  sign() {
    const result = jwt.sign({}, secretKey, refreshTokenOptions); // payload 없음

    return result;
  },

  // Refresh Token 검증
  async verify(token, userId) {
    let conn;
    let decoded;

    try {
      conn = await pool.getConnection();
      const dbToken = await userDB.getRefreshTokenByUserId(conn, userId);

      if (!dbToken) {
        console.log('invalid user');
        return TOKEN_INVALID;
      }

      // 클라이언트에서 보낸 토큰과 DB에 저장된 토큰이 같으면
      if (token === dbToken) {
        decoded = jwt.verify(token, secretKey);
      } else {
        return TOKEN_INVALID;
      }
    } catch (err) {
      if (err.message === 'jwt expired') {
        console.log('expired refresh token');
        return TOKEN_EXPIRED;
      } else if (err.message === 'invalid token') {
        console.log('invalid refresh token 1');
        return TOKEN_INVALID;
      } else {
        console.log('invalid refresh token 2');
        return TOKEN_INVALID;
      }
    } finally {
      conn.release();
    }

    return decoded;
  },
};

module.exports = {
  accessToken,
  refreshToken,
};
