const dotenv = require('dotenv');
dotenv.config();

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    url: process.env.PROD_URL,
  };
} else {
  module.exports = {
    url: process.env.DEV_URL,
  };
}
