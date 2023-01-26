/********require part**************/
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage });

/*****************************************************/
/********web get 响应 part**************/
/*****************************************************/

/**响应页面 show all campground**/
/********将async method 传入 catchAsync func处理 error handler catch, next 均在catchAsync 中***********/
router.get('/', catchAsync(campgrounds.index));

/**响应页面 转到添加新campground 的页面**/
/**order is matter, need in the front of app.get('/campgrounds/:id' 否则New会被认为是id
isLoggedIn is middleware 此页面需要登录才能进去操作**/
router.get('/new', isLoggedIn, campgrounds.newRequest);
/**响应页面 show the campground by its database id,  Note: this method need put 后面，注意顺序！**/
router.get('/:id', catchAsync(campgrounds.showCampground));
/**响应页面， 转到 对特定campground 进行修改的页面**/
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editRequest));

/*****************************************************/
/********web post 响应 part**************/
/*****************************************************/

/**响应页面， 处理特定campground add 添加新camp的请求**/
/********将async method 传入 catchAsync func处理 error handler catch, next 均在catchAsync 中
其实 async 中不需要加这个next 参数，因为在catchAsync 中 func(req, res, next).catch(next);
这一步 就自动给加上了这个参数， 对否？？ 其他的几部分 没有在这里加Next 也可以响应***********/

router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

/**响应页面， 处理特定campground edit 修改的请求**/
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground));

/**响应页面， 处理特定campground删除的请求**/
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
