const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

async function initialize(passport, pool) {

  const authenticateUser = async (email, password, done) => {
    await pool.query(
      `SELECT * FROM production_user WHERE email = $1`, [email],
      async (err, results) => {
        if (err) { throw err; }
        if (results.rows.length > 0) {
          const user = results.rows[0];
          await bcrypt.compare(password, user.password, async (err, isMatch) => {
            if (err) {
              console.print(err);
            }
            if (isMatch) {
              return await done(null, user);
            } else {
              //password is incorrect
              return await done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          /* CHECK THIS. doesn't seem to be reaching this far. */
          return await done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password", roleField: 'role' },
      authenticateUser 
    )
  );

  // passport.use(new LocalStrategy({
  //   usernameField: "email", passwordField: "password", roleField: 'role' , passReqToCallback: true,
  // },
  //   function(username, password, role, done) {
  //     User.findOne({ username: username }, function (err, user) {
  //       if (err) { return done(err); }
  //       if (!user) { return done(null, false); }
  //       if (!user.verifyPassword(password)) { return done(null, false); }
  //       return done(null, user);
  //     });
  //   }
  // ));




  // Stores user details inside session. serializeUser determines which data of the user
  // object should be stored in the session. The result of the serializeUser method is attached
  // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
  //   the user id as the key) req.session.passport.user = {id: 'xyz'}
  passport.serializeUser((user, done) => done(null, user.id));

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user

  passport.deserializeUser(async (id, done) => {
    await pool.query(`SELECT * FROM production_user WHERE id = $1`, [id], async (err, results) => {
      if (err) {
        return await done(err);
      }
      return await done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;