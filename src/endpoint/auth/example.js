// const util = require('../../../lib/util');
// const statusCode = require('../../../constants/statusCode');
// const responseMessage = require('../../../constants/responseMessage');
// const db = require('../../repository/db');
// const query = require('../../repository/mysql');

// module.exports = async (req, res) => {
//   const { email, password } = req.body;

//   // email or password 빈칸인 경우
//   if (!email || !password)
//     return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.BLANK_BOX));

//   let client;

//   try {
//     client = await db.connect(req);

//     const field = await query.example(client, fieldId);

//     res.status(statusCode.OK).send(
//       util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, {
//         user,
//       }),
//     );
//   } catch (error) {
//     res
//       .status(statusCode.INTERNAL_SERVER_ERROR)
//       .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
//   } finally {
//     client.release();
//   }
// };
