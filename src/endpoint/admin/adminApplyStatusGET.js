const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const { toArrayOfString, toArrayOfNumber } = require('../../lib/convertArrayToString');
const pool = require('../../repository/db');
const { serviceDB } = require('../../repository');

// 서비스 매칭 신청 가능 상태 조회
module.exports = async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    let applyStatus = await serviceDB.getApplyStatus(conn);

    // 결과가 없는 경우
    if (!applyStatus) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ADMIN_NO_RESULT));
    }

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.GET_SERVICE_APPLY_STATUS_SUCCESS, {
        applyStatus,
      }),
    );
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
