const util = require('../../lib/util');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const pool = require('../../repository/db');
const { serviceDB, teamDB } = require('../../repository');

module.exports = async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    let maleIsFulled;
    let femaleIsFulled;

    const isLimited = await serviceDB.getApplyIsLimited(conn);

    // 신청 인원 제한이 없는 경우
    if (isLimited.maleIsLimited === false) {
      maleIsFulled = false;
    } else {
      const maleLimitNum = await serviceDB.getMaleLimitNum(conn);
      const maleApplyNum = await teamDB.getMaleApplyNum(conn);

      // 신청인원이 제한인원 보다 적은 경우
      if (maleApplyNum < maleLimitNum) maleIsFulled = false;
      else maleIsFulled = true;
    }

    if (isLimited.femaleIsLimited === false) {
      femaleIsFulled = false;
    } else {
      const femaleLimitNum = await serviceDB.getFemaleLimitNum(conn);
      const femaleApplyNum = await teamDB.getFemaleApplyNum(conn);

      // 신청인원이 제한인원 보다 적은 경우
      if (femaleApplyNum < femaleLimitNum) femaleIsFulled = false;
      else femaleIsFulled = true;
    }

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.GET_SERVICE_APPLY_STATUS_SUCCESS, {
        maleIsFulled,
        femaleIsFulled,
      }),
    );
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    conn.release(); // 빌려온 connection 반환
  }
};
