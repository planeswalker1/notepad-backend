const User = require('../models/schemas/user');
const bcrypt = require('bcrypt');
const config = require('../models/config')

/**
  find all users in db and return them
  @return {Object} - all users in the db
*/
// exports.getUsers = function (req, res, next) {
//   User.find({}, function (err, users) {
//     if (err) return next(err);

//     return res.json(users);
//   });
// };

/**
  find a user and return it
  @param {String} req.user.id - user token id
  @return {Object} - found user
*/
exports.getUserById = function (req, res, next) {
  // console.log('req.user in api hit getUserById()', req.user);
  // **find a user and populate it's pages with page info
  User.findById(req.user.id)
    // this works idk why
    // old jank version
    // { 'pages', { _id: 1, name: 1, text: 1 }   
    .populate({ path: 'pages', select: '_id name text' })
    .exec(function (err, user) {
      if (err) {
        next(err);
      }
      if (!user) {
        return res.status(404).send('No user with that ID');
      }

      // console.log('found user', user);
      return res.json(user);
    });
};

/**
  create a user
  @param {String} req.body - object containing user info
  @param {String} req.body.email - user email
  @param {String} req.body.password - user password
  @return {Object} - response object
*/
exports.createUser = function (req, res, next) {
  // console.log('createUser called');
  // **validate inputs
  if (typeof req.body.email !== 'string') {
    return res.status(400).send('Missing email');
  }
  if (typeof req.body.password !== 'string' && typeof req.body.hash !== 'string') {
    return res.status(400).send('Missing password');
  }
  // http://emailregex.com
  if (!req.body.email || !(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email))) {
    return res.status(400).send('Invalid email');
  }

  // **create userData from req.body to create new user
  var userData = {};
  userData.email = req.body.email;
  if (req.body.password) {
    userData.hash = req.body.password;
  }
  if (req.body.hash) {
    userData.hash = req.body.hash;
  }

  // **create new user
  // console.log('userData for new user', userData)
  var newUser = new User(userData);
  newUser.save(function (err, user) {
    if (err) {
      if (err.code === 11000) {
        return res.status(400).send('Email already registered');
      }
      return next(err);
    }

    return res.sendStatus(200);
  });
};

/**
  update a user
  @param {String} req.user.id - user token id 
  @param {Object} req.body - updated user info
  @param {String} req.body.email - user updated email
  @param {String} req.body.password - user updated password
  @return {Object} - response object
*/
exports.updateUserById = function (req, res, next) {
  let userData = {};

  if (req.body.email) {
    userData.email = req.body.email;
  }

  if (req.body.password) {
    userData.hash = req.body.password;
  }
  if (req.body.hash) {
  userData.hash = req.body.hash;
  }

  // **hash before saving
  // **since mongoose findByIdAndUpdate bypasses hooks
  if (userData.hash) {
    bcrypt.genSalt(config.saltRounds, function (err, salt) {
      if (err) {
        return console.log('error', err);
      }
      bcrypt.hash(userData.hash, salt, function (err, hash) {
        // Store hash in DB.
        userData.hash = hash;

        User.findByIdAndUpdate(req.user.id, userData, { new: true, upsert: true }, function (err, user) {
          if (err) {
            if (err.code === 11000) {
              return res.status(400).send('Email already registered');
            }
            return next(err);
          }
          if (!user) {
            return res.status(404).send('No user with that ID');
          }

          return res.sendStatus(200);
        });
      });
    });
  }
  else {
    User.findByIdAndUpdate(req.user.id, userData, { new: true, upsert: true }, function (err, user) {
      if (err) {
        if (err.code === 11000) {
          return res.status(400).send('Email already registered');
        }
        return next(err);
      }
      if (!user) {
        return res.status(404).send('No user with that ID');
      }

      return res.sendStatus(200);
    });
  }
};

// /**
//   delete a user in the db
//   @param {String} req.params.id - user id in url
//   @return {Object} - response object
// */
// exports.deleteUserById = function (req, res, next) {
//   User.findByIdAndDelete(req.params.id, function (err, user) {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.status(404).send('No user with that ID');
//     }
//     return res.sendStatus(200);
//   });
// };