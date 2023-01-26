/********require part**************/
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
/**register 注册页面响应**/
/**register 注册请求处理**/
router.route('/register')
      .get(users.renderRegister)
      .post(catchAsync(users.register));

/**log in 登录页面响应**/
/**login 登录请求处理， 使用passport middleware 用来进行用户登录验证**/
router.route('/login')
      .get(users.renderLogin)
      .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), users.login);

/**log out 登出页面响应**/
router.get('/logout', users.renderLogout);


module.exports = router;
