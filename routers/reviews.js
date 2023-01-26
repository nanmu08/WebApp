/********require part**************/
const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');
/**Note:因为app.js 中使用的是 app.use('/campgrounds/:id/reviews' 传进来的参数，
需要mergeParams才能传进来， Why????**/

const router = express.Router({ mergeParams: true });

/*****************************************************/
/********web post 响应 part**************/
/*****************************************************/

/**处理 添加 review 评论的请求**/
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));
/**处理 删除某一个camp下的某一条review 的请求**/
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;
