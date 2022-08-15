const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const axios = require('axios');
const pool = require('../../repository/db');
const { userDB } = require('../../repository');
const authKakaoSignup = require('./authKakoSignup');
const authKakaoLogin = require('./authKakaoLogin');
const urlConfig = require('../../config/urlConfig');

module.exports = async (req, response) => {
  let conn;

  try {
    conn = await pool.getConnection(); // pool에서 connction 빌려오기
    // 클라이언트에서 넘겨준 인가코드
    const code = req.query.code;

    if (!code) {
      return response.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CODE));
    }

    const GRANT_TYPE = 'authorization_code'; // 고정값
    const CLIENT_ID = process.env.KAKAO_REST_API_KEY; // 앱 REST API 키
    const REDIRECT_URI = `${urlConfig.clientUrl}/auth/kakao/callback`;

    const KAKAO_GET_TOKEN_URI = `grant_type=${GRANT_TYPE}&client_id=${CLIENT_ID}&redirect_url=${REDIRECT_URI}&code=${code}`;

    // 인가코드를 이용해 토큰 받아오기
    await axios({
      method: 'post',
      url: 'https://kauth.kakao.com/oauth/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      data: KAKAO_GET_TOKEN_URI,
    })
      .then(async (res) => {
        const ACCESS_TOKEN = res.data.access_token;

        //유저 정보 불러오기
        await axios({
          method: 'get',
          url: 'https://kapi.kakao.com//v2/user/me',
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        })
          .then(async (res) => {
            const kakaoUser = res.data;
            const user = await userDB.getUserByKakaoUid(conn, kakaoUser.id);

            // DB에 해당 유저가 없으면 회원가입 API 호출
            if (!user) {
              const newUser = await authKakaoSignup(kakaoUser);

              if (!newUser) {
                return response
                  .status(statusCode.INTERNAL_SERVER_ERROR)
                  .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
              }
              return response
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.CREATE_USER_SUCCESS, { user: newUser }));
            }
            // DB에 해당 유저가 있으면 로그인 API 호출
            else {
              const loginUser = await authKakaoLogin(kakaoUser);

              if (!loginUser) {
                return response
                  .status(statusCode.INTERNAL_SERVER_ERROR)
                  .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
              }
              return response
                .status(statusCode.OK)
                .send(util.success(statusCode.OK, responseMessage.LOGIN_USER_SUCCESS, { user: loginUser }));
            }
          })
          .catch((err) => {
            console.log(err.response.data);
          });
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  } catch (error) {
    response
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
