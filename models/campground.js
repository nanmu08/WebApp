const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String
});
ImageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_200');
});


const opts = { toJSON: { virtuals: true } };//用于 总 map 中的 popup
const CampgroundSchema = new Schema({
  title: String,
  image: [ImageSchema],
  geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
}, opts);

/**一个virtual method 并不储存在db中，只是在网页响应时，如果出现
properties.popUpMarkup 则暂时执行以下的行为，本项目中，用于将id Title
传入主页的主地图中，当点击单个原点图标时，导航到其camp的show page**/
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

/**delete middleware 用于 在删除一个campground时，其相关的review (在 reviews 数据库中的)
也要对应删除，post()中的trigger要根据，app.js 里的变化而变化（对应了findByIdAndDelete），
如果不对应，则不能引发此middleware**/
CampgroundSchema.post('findOneAndDelete', async function(doc) {
  if(doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
});

const Campground = mongoose.model('Campground', CampgroundSchema);
module.exports = Campground;
