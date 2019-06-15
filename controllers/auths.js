const jwt = require('jsonwebtoken');
const User = require('../models/schemas/user');
const config = require('../models/config');


/**
  login a user
  @param {String} req.body.email - email sent by user
  @param {String} req.body.password - password sent by user
  @return {Object} - token in an object
*/
exports.loginUser = function (req, res, next) {
  // console.log('loginUser in api ran')
  // **validate inputs
  if (typeof req.body.email !== 'string') {
    return res.status(400).send('Missing email');
  }
  if (typeof req.body.password !== 'string') {
    return res.status(400).send('Missing password');
  }
  
  // console.log('finding user');
  // **find user
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send('No user with that email');
    }

    // console.log('found user', user);
    // console.log('comparing password');
    // **compare provided password with hash
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (err) {
        return next(err);
      }
      if (!isMatch) {
        return res.status(401).send('Incorrect password');
      }

      // **create token
      // console.log('creating token');
      var payload = {
        id: user._id,
        email: user.email
      };
      // console.log('payload', payload);
      var token = jwt.sign(payload, config.secret);
      // console.log('token in loginUser', token)
      // **save token
      user.token = token;

      user.save(function (err, user) {
        if (err) {
          return next(err);
        }
        // **send token
        // console.log('sending token');
        return res.json({ token: token });
      });
    });
  });
}

/**
  Validate token
  @param {String} req.headers[x-access-token] - user token
  @return {function} - call next()
*/
exports.validateToken = function (req, res, next) {
  // console.log('validateToken in api ran');
  // if (req.headers['x-access-token']) {
  //   console.log('token passed from front-end server headers', req.headers['x-access-token']);
  // }

  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // console.log('token that was caught', token);
  // **check for token
  if (!token) {
    return res.status(403).send('This endpoint requires a token');
  }
  // **decode token
  try {
    var decoded = jwt.verify(token, config.secret);
  } catch (err) {
    return res.status(403).send('Failed to authenticate token');
  }

  // console.log('finding user');
  // **find user
  User.findById(decoded.id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(403).send('Invalid user');
    }
    if (token !== user.token) {
      return res.status(403).send('Expired token');
    }

    // **attach decoded token and token to request
    // console.log('found user');
    // console.log('user.token', user.token);
    req.user = decoded;
    // console.log('req.user', req.user);
    req.token = user.token;
    // console.log('req.token', req.token);
    next();
  });
}

/**
  logout user
  @param {String} req.user.id - user decoded token id
  @return {Object} - response object
*/
exports.logOutUser = function (req, res, next) {
  // console.log('logOutUser ran');
  User.findById(req.user.id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).send('No user with that ID');
    }
    // console.log('found user', user);
    user.token = '';
    // console.log('user token removed', user);
    user.save(function (err, user) {
      if (err) return next(err);
      // console.log('user updated! deleted their token');
      return res.status(200).send('ok');
    });
  });
}