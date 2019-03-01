const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const config = require('../config');
const Page = require('./page');

// schema for a user
var userSchema = new Schema({
  email: { type: String, trim: true, required: true, unique: true, sparse: true },
  hash: { type: String, required: true },
  pages: [{type: Schema.ObjectId, ref: 'Page'}],
  token: String
});

// methods for validating password
userSchema.methods.comparePassword = function(pw, callback) {
	bcrypt.compare(pw, this.hash, function(err, isMatch) {
    console.log(pw, isMatch, "in compare password");
    if (err) return callback(err);

		callback(null, isMatch);
	});
};

userSchema.pre('save', function(next) {
  // to hash pw need to set this to user
  let user = this;

  if (!user.email) return next(new Error('Missing email'));
  if (!user.hash) return next(new Error('Missing password'));
  // dont hash pw if hashed
  if (!user.isModified('hash')) {
    console.log('returned before hashing')
    return next()
  };

  // hash pw
  bcrypt.genSalt(config.saltRounds, function(err, salt) {
    if (err) return console.log('error', err);

    bcrypt.hash(user.hash, salt, function(err, hash) {
        // Store hash in your password DB.
        console.log('HASHED');
        user.hash = hash;
        return next();
    });
  });

});

var User = mongoose.model('User', userSchema);

module.exports = User;