const express = require('express');
let router = express.Router();
const app = express();

const users = require('../controllers/users');
const auths = require('../controllers/auths');

router.route('/')
  .get(auths.validateToken, users.getUserById)
  .post(users.createUser);
  // .put(users.updateUserById)
  // .delete(users.deleteUserById);

module.exports = router;