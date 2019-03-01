const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for every note in a user's notes
var pageSchema = new Schema({
  name: {type: String, default: 'New Note'},
  text: {type: String, default: 'Hello World'}
  },
  {
    toObject: {getters: true},
    timestamps: {
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    }
  }
);

pageSchema.pre('save', function (callback) {
  callback();
  // TODO replace return and spaces with \n \s
  // maybe dont have to and mongo takes care of it
});

var Page = mongoose.model('Page', pageSchema);

module.exports = Page;