/* Mount and configure session and flash middleware */
require('dotenv').config()
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const passport = require('passport')
const flash = require('connect-flash')
const pool = require('../db')

module.exports = app => {

  app.use(session({
    store: new pgSession({
      pool: pool, 
      createTableIfMissing: true
    }),
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET, 
    maxAge: 30 * 24 * 60 * 60
  }))

  app.use(passport.initialize())
  app.use(passport.session())
  // Allows us to show the user error messages via the res.locals.error object
  // We use this in the /login route
  app.use(flash())
  app.use((req, res, next) => {
    res.locals.message = req.flash('message');
    res.locals.error = req.flash('error')
    next()
  })

}