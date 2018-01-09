var path = require('path');
var fs = require('fs');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  socket_port: process.env.PORT,
  server_ip: process.env.SERVER_IP,
};
