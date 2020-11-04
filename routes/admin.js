const keys = require("../config/nodeKeys");
const { spawn } = require('child_process');
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
const pool = require('./../dbConfig');
/* ----- Passport config modules ----- */ 
//const LocalStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcrypt');

/* Database config to connect to Postgres DB hosted on Heroku */
// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: keys.PG_CONNECTION_STRING,
//   max: 1,
//   ssl: { rejectUnauthorized: false }
// });

module.exports = (app) => {
  // Sets the view engine to ejs so it can render the admin view code
  app.set("view engine", "ejs");
  /* Home controller for the admin page */
  app.get("/admin", async (req, res) => {
    const { action } = req.query;

    if (action === 'runetl') {

      /* Prepare to run the ETL script */
      //await clearTables();
      log('Job Start');

      /* Run the ETL script */
      const python = spawn('python3', ['ETL/main.py', keys.PG_CONNECTION_STRING]);
      python.stderr.pipe(python.stdout);
      python.stdout.on('data', data => {
        log(data.toString());
      })

    }
    else {
      res.render('admin.ejs');
    }
  });

  /* API method to pull ETL status from the public.etl_run_log table */
  app.get("/admin/etlstatus", async (req, res) => {
    let log = null;
    pool.connect((err, client, release) => {
      if (err) { console.log(err); release(); return; }
      client.query('select * from etl_run_log order by time_stamp asc;', (err, result) => {
        if (err) { release(); return; }
        log = result.rows;
        release();
        res.json(log);
      });
    })
  });
};

/* Helper function to clear all tables like public.etl_% */
const clearTables = async () => {
  pool.connect(async (err, client, release) => {
    if (err) { release(); return; }
    client.query('select etl_clear_tables();', (err, result) => {
      release();
    });
  });
}

/* Helper function to log a message to the database */
const log = async message => {
  pool.connect(async (err, client, release) => {
    if (err) { release(); return; }
    client.query(`select etl_log('${message}');`, (err, result) => {
      release();
    });
  });
}

/* -------- Passport config -------- */
// NOTE: this can be extracted into another file, however atm there concerns about the security of importing pool multiple times, so it's here for now, for convenience until refactor
// function initialize(passport) {

//   const authenticateUser = (email, password, done) => {

//     pool.query(
//       `SELECT * FROM users WHERE email = $1`, [email],
//       (err, results) => {
//         if (err) { throw err; }
//         if (results.rows.length > 0) {
//           const user = results.rows[0];
//           bcrypt.compare(password, user.password, (err, isMatch) => {
//             if (err) {
//               console.log(err);
//             }
//             if (isMatch) {
//               return done(null, user);
//             } else {
//               //password is incorrect
//               return done(null, false, { message: "Password is incorrect" });
//             }
//           });
//         } else {
//           // No user
//           return done(null, false, {
//             message: "No user with that email address"
//           });
//         }
//       }
//     );
//   };

//   passport.use(
//     new LocalStrategy(
//       { usernameField: "email", passwordField: "password" },
//       authenticateUser
//     )
//   );
//   // Stores user details inside session. serializeUser determines which data of the user
//   // object should be stored in the session. The result of the serializeUser method is attached
//   // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
//   //   the user id as the key) req.session.passport.user = {id: 'xyz'}
//   passport.serializeUser((user, done) => done(null, user.id));

//   // In deserializeUser that key is matched with the in memory array / database or any data resource.
//   // The fetched object is attached to the request object as req.user

//   passport.deserializeUser((id, done) => {
//     pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
//       if (err) {
//         return done(err);
//       }
//       return done(null, results.rows[0]);
//     });
//   });
// }

// module.initializePassport = initialize;