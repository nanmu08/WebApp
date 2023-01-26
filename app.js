if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/********require part**************/
const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const {campgroundSchema, reviewSchema} = require('./utils/schemas');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');
const campgroundsRoute = require('./routers/campgrounds');
const reviewsRoute = require('./routers/reviews');
const userRoute = require('./routers/users');
const mongoSanitize = require('express-mongo-sanitize'); //防止恶意获取db data
const helmet = require('helmet');
//const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp';
const dbUrl = process.env.DB_URL;
const MongoStore = require('connect-mongo');
/********app set part**************/
// use ejs-locals for all ejs templates
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
/********app use part  Note: 各个use之间的 order 很重要，**************/
/********用于解析 webpage传回来的 post信息****************/
app.use(express.urlencoded({extended: true}));
/*防止恶意获取db or 篡改，searches for any keys in objects that begin with a $ sign or contain a .*/
app.use(mongoSanitize());
/**用于 响应从网页传回的 put、 delete request**/
app.use(methodOverride('_method'));
/**声明static css 和 js 文件的使用**/
app.use(express.static(path.join(__dirname, 'public')));
/**使用 express session as server side data store
此 use 要放在router 前面，才能传到browser中**/
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: 'thisisasecret'
  },
  touchAfter: 24 * 3600
})
store.on("error", function(e){
  console.log("Session Store Error", e)
})
const sessionConfig = {
  store,
  name: 'express-session',
  secret: 'thisisasecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, see lecture 569
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //7 days有效
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
/**flash setting part**/
app.use(flash());
/**Helmet 通过设置各种 HTTP 标头来帮助保护 Express 应用程序**/
//app.use(helmet());

/**user authentation passport model set middleware用于启动passport 并且session用于检查用户登录状态**/
app.use(passport.initialize());
app.use(passport.session()); // 此session 要放在 大的session 后面
passport.use(new localStrategy(User.authenticate()));
/**用于操作 如何将user 验证 放入session 和 从session 中摘出（如：当退出登录时）**/
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**Note local variable should be passport and session 后面
下面这个use 如果放在 一系列passport的前面时， 则‘登录状态下 只显示登出按键’ 这个设定不起作用**/
app.use((req, res, next) => {

  res.locals.currentUser = req.user; //if log in 则 user 有相关信息，否则undefined
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})
/****具体页面响应 part****/
/**使用 campground router，将campground页面的各种请求传到 子程序中处理**/
app.use('/campgrounds', campgroundsRoute);
/**使用 review router，将creview相关的各种请求传到 子程序中处理**/
app.use('/campgrounds/:id/reviews', reviewsRoute);
/**使用user router, 将用户注册 登录 登出等请求传到子程序中**/
app.use('/', userRoute);
/********mongoose connection part**************/
main()
.then(() => {console.log('mongoose success connected!')})
.catch(err => {
  console.log('mongoose something wrong:')
  console.log(err)});

async function main() {
  await mongoose.connect(dbUrl);
}

//mongodb://localhost:27017/YelpCamp


/**server side validation 使用 joi 自定义 validation 内容, 作为middleware**/



/********web get 响应 part**************/
app.get('/', (req, res) => {
  res.render('home');
});

/********web post 响应 part**************/


/********web Error Handler part**************/
/**check 每次 request, 404无效页面响应，顺序很重要，只有上面的都不match, 这个才能响应，
如果这个放在上面，则会影响其他功能, this method 调用 next 则出发后面的那个 app.use error handler**/
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
})
/**Error handler app.use放在最后，用于接受各种错误next 响应
上面的某个Next 将err 参数也传了进来，message status赋予 default value
以防上面的没有传来相应信息**/
app.use((err, req, res, next) => {
  const {status = 500} = err;
  if(!err.message) err.message = 'Something Wrong Happen!'
  res.status(status).render('error', { err });
});

app.listen(3000, () => {
  console.log('port 3000 are listening');
})
