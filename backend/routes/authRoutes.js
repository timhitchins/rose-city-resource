const keys = require("../../config/nodeKeys");
const passport = require("passport");
const path = require('path');
const bcrypt = require('bcrypt');
var sanitizeHtml = require('sanitize-html');

module.exports = (app, db) => {

  /* Config for auth and express session */
  require('../services/expressSession')(app)
  require('../services/passport') 

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


}