const pool = require('../../repository/db');
const { userDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 유저 개인 정보 저장 및 수정
module.exports = async (req, res) => {
  const { userId, phone, kakaoId, serviceConfirm, privateInfConfirm, ageInfo, marketingConfirm } = req.body;

  if (
    !userId ||
    !phone ||
    !kakaoId ||
    !(serviceConfirm === true || serviceConfirm === false) ||
    !(privateInfConfirm === true || privateInfConfirm === false) ||
    !(ageInfo === true || ageInfo === false) ||
    !(marketingConfirm === true || marketingConfirm === false)
  ) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST || !responseMessage.NULL_VALUE));
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // 유저가 없는 경우
    const user = await userDB.getUserById(conn, userId);
    if (!user) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
    }

    // 잘못된 유저 id인 경우
    if (userId != req.user.id) {
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_USER));
    }

    const result = await userDB.saveUserPrivacy(
      conn,
      userId,
      phone,
      kakaoId,
      serviceConfirm,
      privateInfConfirm,
      ageInfo,
      marketingConfirm,
    );

    if (result === true) {
      res.status(statusCode.OK).send(
        util.success(statusCode.OK, responseMessage.SAVE_USER_PRIVACY_SUCCESS, {
          userId,
          phone,
          kakaoId,
          serviceConfirm,
          privateInfConfirm,
          ageInfo,
          marketingConfirm,
        }),
      );
    }
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
