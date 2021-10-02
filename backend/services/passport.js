const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { updateOauthUser, getUserByLocalId, getUserByGoogleId, getUserByEmail } = require('../utils/authUtils')
require('dotenv').config
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require ('bcrypt')

passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserByLocalId(id)
    return done(null, user)
  } catch (error) {
    return done(error)
  }
})

passport.use(
  new LocalStrategy({
    usernameField: 'email'
  },
  async (email, password, done) => {
    try {

      const user = await getUserByEmail(email)

      if (!user) { 
        return done(null, false, { 
          message: 'No user with that email address' 
        })
      }
      const passwordsMatch = await bcrypt.compare(password, user.password)
      
      if (passwordsMatch) {
        return done(null, user)  
      } else {
        return done(null, false, { message: 'Password is incorrect' })
      }
    } catch (error) {
      return next(error)
    }
  }
  )
)

passport.use(
  new GoogleStrategy(
    {
    clientID: process.env.GOOGLE_CLIENT_ID_DEV,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_DEV,
    callbackURL: `/auth/google/callback`,
    proxy: true
    }, 
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        const { email } = profile._json

        const isUser = await getUserByEmail(email)

        if (!isUser) { 
          return done(null, false, { message: 'Email not authorized. Please try a different Gmail address, or login with a password instead' });
        }

        const existingUser = await getUserByGoogleId(profile.id)
        if (existingUser) user = existingUser
        
        else {
          const updatedUser = await updateOauthUser({ googleID: profile.id, email })
          user = updatedUser
        }
        
        return done(null, user)
      
      } catch (error) {
        console.log('Login error', error.message)
        return done(error)  
      }
    }
  )
)

/* 
    oauth info: https://developers.google.com/sheets/api/guides/authorizing
*/