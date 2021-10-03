// Logic directly relating to login authentication goes here
const passport = require("passport");

module.exports = app => {

  /* Config for auth and express session */
  require('../services/expressSession')(app)
  require('../services/passport') 

  /* Handle email/password login */
  app.post('/admin/login',
    passport.authenticate('local', {
      successRedirect: '/admin/dashboard',
      failureRedirect: '/admin/login',
      failureFlash: true
    })
  );

  /* Handle Google Oauth login */
  app.get('/auth/google', 
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })
  )

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

}