if (process.env.NODE_ENV === 'production') {
  module.exports = {
    serverUrl: process.env.SERVER_URL_PROD,
    clientUrl: process.env.CLIENT_URL_PROD,
  };
} else {
  module.exports = {
    serverUrl: process.env.SERVER_URL_DEV,
    clientUrl: process.env.CLIENT_URL_DEV,
  };
}
