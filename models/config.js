const express = require('express');
const app = express();

if (app.get('env') === 'production') {
  module.exports = {
    port: Number(process.env.PORT),
    dbUrl: process.env.DB_URL,
    secret: process.env.SECRET,
    saltRounds: Number(process.env.SALT_ROUNDS)
  }
} else {
  var config = require('./config_dev.js');
  console.log(config);
  module.exports = config;
}