const jwt = require('jsonwebtoken');
const User = require('../models/schemas/user');
const config = require('../models/config');

// this function is going to create a token and assign it to a user
// this works by checking:
  // if the request has a email and password
  // check the user db for a user with that email
  // check if the passwords match
  // if all are true
    // create and return a token containing the users: id, and notes

exports.loginUser = function (req, res, next) {
  console.log('loginUser in api ran')
  
  if (typeof req.body.email !== 'string')
    return res.status(400).send('Missing email');
  if (typeof req.body.password !== 'string')
    return res.status(400).send('Missing password');
  
  
  console.log('looking for user');
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return next(err);
    if (!user)
      return res.status(400).send('No user with that email');

    console.log('found user', user);
    console.log('comparing password');
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (err) return next(err);
      if (!isMatch)
        return res.status(401).send('Incorrect password');

      console.log('creating token');
      var payload = {
        id: user._id,
        email: user.email
      };
      console.log('payload', payload);
      var token = jwt.sign(payload, config.secret);
      console.log('token in loginUser', token)
      user.token = token;

      user.save(function (err, user) {
        if (err) return next(err);

        console.log('sending token');
        return res.json({ token: token });
      });
    });
  });
}

// this function is going to search for a token in the req.body, url, or headers
// try to decode the token
  // set req.user to decoded token
// else
  // return 403 error
// send to next middleware transporting the token
exports.validateToken = function (req, res, next) {
  console.log('validateToken in api ran');
  if (req.headers['x-access-token'])
    console.log('token passed from front-end server headers', req.headers['x-access-token']);

  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  console.log('token that was caught', token);
  if (!token)
    return res.status(403).send('This endpoint requires a token');

  try {
    var decoded = jwt.verify(token, config.secret);
  } catch (err) {
    return res.status(403).send('Failed to authenticate token');
  }

  console.log('looking for user');
  User.findById(decoded.id, function (err, user) {
    if (err)
      return next(err);
    if (!user)
      return res.status(403).send('Invalid user');
    if (token !== user.token)
      return res.status(403).send('Expired token');

    console.log('found user');
    console.log('user.token', user.token);
    req.user = decoded;
    console.log('req.user', req.user);
    req.token = user.token;
    console.log('req.token', req.token);
    next();
  });
}

exports.logOutUser = function (req, res, next) {
  console.log('logOutUser ran');
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    if (!user)
      return res.status(404).send('No user with that ID');
    console.log('found user', user);
    user.token = '';
    console.log('user token removed', user);
    user.save(function (err, user) {
      if (err) return next(err);
      console.log('user updated! deleted their token');
      return res.status(200).send('ok');
    });
  });
}