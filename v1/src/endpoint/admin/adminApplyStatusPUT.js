const pool = require('../../repository/db');
const { serviceDB } = require('../../repository');
const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');

// 서비스 매칭 신청 가능 상태 변경
module.exports = async (req, res) => {
  const { maleIsLimited, maleLimitNum, femaleIsLimited, femaleLimitNum } = req.body;

  if (maleIsLimited !== true && maleIsLimited !== false) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (femaleIsLimited !== true && femaleIsLimited !== false) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (typeof maleLimitNum !== 'number' || typeof femaleLimitNum !== 'number') {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (maleLimitNum < 0 || femaleLimitNum < 0) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const success = await serviceDB.updateApplyStatus(
      conn,
      maleIsLimited,
      maleLimitNum,
      femaleIsLimited,
      femaleLimitNum,
    );

    if (success === true) {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, responseMessage.UPDATE_SERVICE_APPLY_STATUS_SUCCESS, { success }));
    }
  } catch (error) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release();
  }
};
