const Page = require('../models/schemas/page');
const User = require('../models/schemas/user');
const mongoose = require('mongoose');

exports.getPages = function (req, res, next) {
  Page.find({}, function (err, pages) {
    if (err) return next(err);

    return res.json(pages);
  });
};

exports.createPage = function (req, res, next) {
  // validate inputs
  if (typeof req.body.name !== 'string')
    return res.status(400).send('Invalid Title');
  if (typeof req.body.text !== 'string')
    return res.status(400).send('Invalid Note');
  
  // add page info
  var pageData = {};
  pageData.name = req.body.name;
  pageData.text = req.body.text;
  console.log('pageData', pageData);
  
  // create page with pageData
  var newPage = new Page(pageData);
  newPage.save(function (err, page) {
    if (err) return next(err);
    
    console.log('created page', page);
    // look for user to store page id into
    User.findById({ _id: req.user.id }, function (err, user) {
      if (err) return next(err);
      if (!user)
        return res.status(404).send('No user with that ID');

      console.log('found user to store page to', user);
      // add id of page to user pages
      user.pages.push(page._id);
      user.save(function (err) {
        if (err) return next(err);

        return res.sendStatus(200);
      });
    });

  });
};

// TODO update a note 
// Idea: The token from the user has a property of notes. i can maybe get the id from the token and use it to update that page
// new idea
// this is gonna be to load the form to update a note
  // pass the index in req.params.index
  // request to GET /notes/:index
  // authenticate
  // look for user with provided id
  // populate the user's notes
  // return notes[i] where i is req.params.index
// exports.getPageToUpdate = function (req, res, next) {
//   console.log('getPageToUpdate in api ran');
//   console.log('req.params.index', Number(req.params.index), typeof req.params.index);
//   User.findById(req.user.id)
//   .populate('pages', { _id: 1, name: 1, text: 1 })
//   .exec(function (err, user) {
//     if (err) return next(err);
//     if (!user)
//       return res.status(404).send('No user with that ID');

//     console.log('found user');
//     console.log('user.pages', user.pages);
//     console.log('requested page to update', user.pages[req.params.index]._id);
//     return res.sendStatus(200);
//   });
// };

exports.getPageById = function (req, res, next) {
  console.log('getPageById in api ran');
  console.log('getting page to render update form and fill with info');
  console.log('req.params.id', req.params.id, typeof req.params.id);
  Page.findById(req.params.id, function (err, page) {
    if (err) return next(err);
    if (!page)
      return res.status(404).send('No page with that ID');

    console.log('found page', page);
    return res.json(page);
  });
};

exports.updatePageById = function (req, res, next) {
  console.log('updatePageById in api ran');
  console.log('expected id', req.params.id, typeof req.params.id);
  console.log('expected req.body', req.body);
  console.log('req.body was empty took me 10 years to find out why');
  Page.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, page) {
    if (err) return next(err);
    if (!page) 
      return res.status(404).send('No Note with that ID');

    console.log('updated note!', page);
    
    return res.sendStatus(200);
  });
}

exports.deletePageById = function (req, res, next) {
  console.log('deletePageById called in api');
  console.log('expected page id', req.params.id);
  Page.findByIdAndDelete(req.params.id, function (err, page) {
    if (err) return next(err);
    if (!page) 
      return res.status(404).send('No Note with that ID');
    console.log('deleted note');
    console.log('finding User with that note to delete from their user.pages');
    
    User.findOne({ 'pages': mongoose.Types.ObjectId(req.params.id) }, function (err, user) {
      if (err) console.log(err);
      if (!user)
        return res.sendStatus(200);
      
      console.log('found user that has that id', user);
      console.log('user.pages', user.pages);
      let indexOfPage = user.pages.indexOf(req.params.id);
      user.pages.splice(indexOfPage, 1);
      user.save(function (err) {
        if (err) return next(err);
          return res.sendStatus(200);
      });
    })
  });
};

