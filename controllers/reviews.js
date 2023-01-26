const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  //将 新建评论的用户Id 存入该条评论中
  review.author = req.user._id;
  // push this new review to 相对应的 campground object中
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'New review created!');
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
  const {id, reviewId} = req.params;
  /*用于删除camp-review-中的某一条，The $pull operator removes from an existing array all
  instances of a value or values that match a specified condition.*/
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Review deleted!');
  res.redirect(`/campgrounds/${id}`);
}
