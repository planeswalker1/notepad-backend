const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const config = require('./models/config');

const usersRouter = require('./routes/users');
const pagesRouter = require('./routes/pages');
const auths = require('./controllers/auths');
const authRouter = require('./routes/auth');
let app = express();

mongoose.connect(config.dbUrl, { useNewUrlParser: true }).then(() => {
  console.log("Connected to Database");
}).catch((err) => {
  console.log("Not Connected to Database ERROR! ", err);
});


// log if in dev
if (app.get('env') === 'development') {
  var dev = true;
}
if (dev) {
  app.use(logger('dev'));
}

// create req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ============================
// Routes
// ============================

// crud
app.use('/users', usersRouter);
app.use('/pages', pagesRouter);
app.use('/auth', authRouter);
app.put('/logout', auths.validateToken, auths.logOutUser);

// development error handler
if (dev) {
  app.use(function (err, req, res, next) {
    console.log(err);
    return res.sendStatus(err.status || 500);
  });
}

// production error handler
app.use(function (err, req, res, next) {
  return res.sendStatus(err.status || 500);
});

app.listen(config.port, function () {
  console.log('Listening at port %s in %s mode', config.port, app.get('env'));
});