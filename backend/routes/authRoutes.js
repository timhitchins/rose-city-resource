// Logic directly relating to login authentication goes here
// NOTE: ALL routes mounted after this file are protected
// and can be accessed by logged-in users only
const passport = require("passport");
const path = require('path')

module.exports = app => {

  // // Set the path to our "views" directory
  // app.set('views', path.join(__dirname, '../../admin/views'))


  /* Config for auth and express session */
  require('../services/expressSession')(app)
  require('../services/passport') 

  /* Handle input from the login form */
  app.post('/admin/login',
    passport.authenticate('local', {
      successRedirect: '/admin/dashboard',
      failureRedirect: '/admin/login',
      failureFlash: true
    })
  );

  app.get('/auth/google', 
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })
  )

  // OAuth handler
  app.post('/auth/google', 
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })
  )

  app.get('/auth/google/callback', 
    passport.authenticate('google', {
      successRedirect: '/admin/home', 
      failureRedirect: '/admin/login',
      failureFlash: true
    })
  )

  /* Logout */
  app.get('/admin/logout', (req, res) => {
    req.logout();
    res.setHeader('Cache-Control', 'no-cache');
    res.render('login', { message: 'You have logged out successfully' });
  });

}