const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
}
module.exports.renderLogin = (req, res) => {
  res.render('users/login');
}
module.exports.renderLogout = (req, res) => {
  /**这个Method是因为 passport 在起作用吗？
  req.logout() call is now an asynchronous function, requires a callback function as an argument.**/
  req.logout((err) => {
    if(err) {return next(err);}
    req.flash('success', `GoodBye`);
    res.redirect('/campgrounds');
  });
}

module.exports.register = async (req, res) => {
  try {
    const {email, username, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    /**passport login() 使用户注册后即登录，不用再登陆一遍**/
    req.login(registeredUser, err => {
      if(err) return next(err);
      req.flash('success', 'Welcome to the Camp');
      res.redirect('/campgrounds');
    })
  } catch(e) {
    /**处理一些错误，如该注册用户名已经存在 这个情况**/
    req.flash('error', e.message);
    res.redirect('/register');
  }
}

module.exports.login = (req, res) => {
  req.flash('success', `Welcome Back, ${req.user.username}`);
  /*如果 此登录请求是从其他页面转过来的，则登录后再转回去，如果直接从主页登录的，
  则没有returnTo, 此时要转到主页， Note: 此次returnTo用完后，应删除
  Note 22.8.14 lecture 519 中的returnTo 不起作用了*/
  //console.log(req.session.returnTo);
  const redirectUrl = req.session.returnTo || '/campgrounds';
  //console.log(redirectUrl);
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}
