const express = require('express');
const app = express();

let router = express.Router();

const pages = require('../controllers/pages');
const auths = require('../controllers/auths');

router.param('id', (req, res, next, id) => {
  console.log('param middleware ran');
  console.log('incoming id', id, typeof id);
  if (typeof Number(id) !== 'number')
    return res.status(400).send('Invalid Note');
  next();
});

router.route('/:id')
  .get(auths.validateToken, pages.getPageById)
  .put(auths.validateToken, pages.updatePageById)
  .delete(auths.validateToken, pages.deletePageById);

router.route('/')
  .post(auths.validateToken, pages.createPage);

module.exports = router;