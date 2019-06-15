const Page = require('../models/schemas/page');
const User = require('../models/schemas/user');
const mongoose = require('mongoose');

/**
  get all pages in db
  @return {Object} - all items in the db
*/
// exports.getPages = function (req, res, next) {
//   Page.find({}, function (err, pages) {
//     if (err) {
//       return next(err);
//     }
//     return res.json(pages);
//   });
// };

/**
  create a page and store it in the db
  @param {String} req.user.id - user token id
  @param {String} req.body.name - page name
  @param {String} req.body.text - page text
  @return {Object} - items
*/
exports.createPage = function (req, res, next) {
  // **validate inputs
  if (typeof req.body.name !== 'string') {
    return res.status(400).send('Invalid Title');
  }
  if (typeof req.body.text !== 'string') {
    return res.status(400).send('Invalid Note');
  }
  
  // **add page info to an object to create a new page
  var pageData = {};
  pageData.name = req.body.name;
  pageData.text = req.body.text;
  // console.log('pageData', pageData);
  
  // **create page with pageData
  var newPage = new Page(pageData);
  newPage.save(function (err, page) {
    if (err) {
      return next(err);
    }
    // console.log('created page', page);
    // **find a user to store page id into
    User.findById({ _id: req.user.id }, function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(404).send('No user with that ID');
      }

      // console.log('found user to store page to', user);
      // **add id of page to user's pages
      user.pages.push(page._id);
      user.save(function (err) {
        if (err) {
          return next(err);
        }

        return res.sendStatus(200);
      });
    });

  });
};

// ===========================
// resolved
// ===========================
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

/**
  find a page and return it
  @param {String} req.params.id - page id
  @return {Object} - requested page
*/
exports.getPageById = function (req, res, next) {
  // console.log('getPageById in api ran');
  // console.log('getting page to render update form and fill with info');
  // console.log('req.params.id', req.params.id, typeof req.params.id);
  // **find a page
  Page.findById(req.params.id, function (err, page) {
    if (err) {
      return next(err);
    }
    if (!page) {
      return res.status(404).send('No page with that ID');
    }

    // console.log('found page', page);
    return res.json(page);
  });
};

/**
  update a user's page
  @param {String} req.headers.id - room id
  @param {Object} req.body - page info
    @param {String} req.body.name - page name
    @param {String} req.body.text - page text
  @return {Object} - response object
*/
exports.updatePageById = function (req, res, next) {
  // console.log('updatePageById in api ran');
  // console.log('expected id', req.params.id, typeof req.params.id);
  // console.log('expected req.body', req.body);
  // console.log('req.body was empty took me 10 years to find out why');
  // **find a page by and update it 
  Page.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, page) {
    if (err) {
      return next(err);
    }
    if (!page) {
      return res.status(404).send('No Note with that ID');
    }
    // console.log('updated note!', page);
    
    return res.sendStatus(200);
  });
}

/**
  delete a user's page
  @param {String} req.params.id - room id
  @return {Object} - response object
*/
exports.deletePageById = function (req, res, next) {
  // console.log('deletePageById called in api');
  // console.log('expected page id', req.params.id);
  // **find a page and delete it
  Page.findByIdAndDelete(req.params.id, function (err, page) {
    if (err) {
      return next(err);
    }
    if (!page) {
      return res.status(404).send('No Note with that ID');
    }
    // console.log('deleted note');
    // console.log('finding User with that note to delete from their user.pages');
    // **find a user
    User.findOne({ 'pages': mongoose.Types.ObjectId(req.params.id) }, function (err, user) {
      if (err) {
        return console.log(err);
      }
      if (!user) {
        return res.sendStatus(200);
      }
      // console.log('found user that has that id', user);
      // console.log('user.pages', user.pages);
      // **delete that page from the user's pages
      let indexOfPage = user.pages.indexOf(req.params.id);
      user.pages.splice(indexOfPage, 1);
      user.save(function (err) {
        if (err) return next(err);
          return res.sendStatus(200);
      });
    })
  });
};