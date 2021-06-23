const LocalStrategy = require('passport-local').Strategy
const bcrypt = require ('bcrypt')

async function initialize(passport, pool) {

  const authenticateUser = async (email, password, done) => {
    try {
      // Query the DB using the email address entered on the login screen
      const queryResult = await pool.query(
        `SELECT * FROM production_user WHERE email = $1`, [email])

        if (!queryResult || !queryResult.rows.length) {
        // tell passport there was no error ("null")
        // and that the user doesn't exist ("false")
        return done(null, false, {
          message: "No user with that email address"
        })
      } else if (queryResult && queryResult.rows.length > 0) {
        // email is registered
        const user = queryResult.rows[0]

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) { throw err }

          if (isMatch) {

            return done(null, user);
          
          } else {
            // password is incorrect
            return done(null, false, { message: 'Password is incorrect' });
          }
        });
      } else {
        return done(null, false, { message: 'Invalid login credentials' })
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(
    new LocalStrategy({ 
      usernameField: "email", 
      passwordField: "password"
      },
      authenticateUser 
    )
  );


  // Stores user details inside session. serializeUser determines which data of the user
  // object should be stored in the session. The result of the serializeUser method is attached
  // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
  //   the user id as the key) req.session.passport.user = {id: 'xyz'}
  passport.serializeUser((user, done) => done(null, user.id));

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user
  passport.deserializeUser((userId, done) => {
    pool.query(`SELECT * FROM production_user WHERE id = $1`, [userId],  (err, results) => {
      if (err) {
        return done(err);
      }
      const user = results.rows[0];
      // Explicitly declare which fields we want to pass to passport
      // The password has been left out of this object
      // for security
      const sessionUser = {
        id: user.id,
        name: user.name, 
        email: user.email,
        role: user.role
      }
      return done(null, sessionUser);
    });
  });
}

module.exports = initialize;
