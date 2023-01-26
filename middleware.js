const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./utils/schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');
/**登录状态 验证的 Middleware, 放在有需要的req部分，对一些需要
权限才能操作的页面 进行验证, isAuthenticated method 由 passport提供**/
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      /*将 当前url记住 放到session中，等登录后，转到当前页面（而不总是转到主页）
      note 22.8.14 新版的passport 更新了，lecture 519 中的returnTo 不起作用了
      需要新的方法，登陆后转到当前界面， 具体看519 的Q&A*/
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

/**server side validation 使用 joi 自定义 validation 内容, 作为middleware**/
module.exports.validateCampground = (req, res, next) => {
  /***campgroundSchema 放到单独的模块中了，utils/schemas***/
  const {error} = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  }else {
    next();
  }
}

/**authorization middleware 防止非本作者的其他用户 对campground进行操作**/
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if(!campground.author.equals(req.user._id)) {
    req.flash('error', 'You are not permitted to do this');
    return res.redirect(`/campgrounds/${campground._id}`);
  }
  next();
}
/**authorization middleware 防止非本作者的其他用户 对review进行操作**/
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)) {
    req.flash('error', 'You are not permitted to do this');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}
/**server side validation 使用 joi 自定义 validation 内容, 作为middleware**/
/**review serverside validation middleware**/
module.exports.validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  }else {
    next();
  }
}
