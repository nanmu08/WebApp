const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapboxToken});

module.exports.index = async (req, res) => {
   const campgrounds = await Campground.find({});
   res.render('campgrounds/index', { campgrounds });
}

module.exports.newRequest = (req, res) => {
  res.render('campgrounds/new');
}
module.exports.showCampground = async (req, res) => {
  /*不仅将与campground 相关的review populate 过来，还将与每条review相关的 author populate过来*/
  const campground = await Campground.findById(req.params.id).populate({
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  if(!campground) {
    req.flash('error', 'Cannot find this campground!');
    return res.redirect('/campgrounds');;
  }
  res.render('campgrounds/show', { campground });
}
module.exports.editRequest = async (req, res) => {
  const campground = await Campground.findById(req.params.id);//Note: need await!!!!
  if(!campground) {
    req.flash('error', 'Cannot find this campground to edit!');
    return res.redirect('/campgrounds');;
  }
  res.render('campgrounds/edit', { campground });
}


module.exports.createCampground = async (req, res, next) => {

  /**用于处理server端， 传入没完全填好字段的new camp (client side只能阻止从网页传来的，
  不能阻止从 postman等其他端传来的不完整信息**/
  //if(!req.body.campground) throw new ExpressError('Invalid Data', 400);

  /**使用 joi 自定义 的 validateCampground 作为 middleware 去 validation 内容**/
  /**********************************************************/
  /**mapbox api used for map geometry data**/
  const getData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();
  const newCamp = new Campground(req.body.campground);
  newCamp.geometry = getData.body.features[0].geometry;
  /**将网页传来的图片 经过前期multer处理 存入 cloudinary后，获取其Path 和 名字
  以存到 db 对应campground中**/
  newCamp.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
  /*将创建此camp 的用户（author id） 也传到campground db中*/
  newCamp.author = req.user._id;
  await newCamp.save();
  console.log(newCamp);
  req.flash('success', 'Successfully make a new campground!');
  res.redirect(`/campgrounds/${newCamp._id}`);
}

module.exports.editCampground = async (req, res) => {
  const {id} = req.params;
  const editCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
  const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  editCampground.image.push(...images);
  await editCampground.save();
  if(req.body.deleteImage){
    for(let filename of req.body.deleteImage){
      await cloudinary.uploader.destroy(filename);
    }
    await editCampground.updateOne({ $pull: {image: {filename: {$in: req.body.deleteImage } } } });
  }
  req.flash('success', 'Success update the campground');
  res.redirect(`/campgrounds/${editCampground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
  const {id} = req.params;
  const deletCamp = await Campground.findByIdAndDelete(id);
  req.flash('success', 'Campground deleted!');
  res.redirect('/campgrounds');
}
