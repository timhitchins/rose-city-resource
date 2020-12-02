const keys = require("../config/nodeKeys");
const { spawn } = require('child_process');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require('path');
const bcrypt = require('bcrypt');

module.exports = (app, pool) => {

  /* Configure Passport, the login mechanism for the admin page */
  const initializePassport = require("../initializePassport");
  initializePassport(passport, pool);
  app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success")
    next();
  });

  /* Default handler for the admin page */
  app.get("/admin/dashboard", userIsAuthenticated, async (req, res, next) => {
    try {

      const { action } = req.query;

      if (action === 'runetl') {
        /* The 'Import to Staging' button was clicked */

        /* Prepare to run the ETL script */
        await clearTables().catch(e => console.log(e));
        log('Job Start');

        /* Run the ETL script */
        const file = path.resolve('ETL/main.py');
        const python = spawn('python3', [file, keys.PG_CONNECTION_STRING]);
        python.on('spawn', (code) => {
          console.log('Python spawn: ' + code)
        })
        python.on('error', (err) => {
          console.log('Python error: ' + err)
        })
        python.on('exit', (code) => {
          console.log('Python exit code: ' + code)
        })
        python.stderr.on('data', (data) => {
          log('Python stderr: ' + data.toString());
        })
        python.stdout.on('data', (data) => {
          log('Python stdout: ' + data.toString());
        })
        res.send('true');
        return;
      }
      else if (action === 'runprod') {

        /* The 'Import to Production' button was clicked */
        await importToProduction();
        res.send('true');
        return;
      }
      else {
        console.log(req.user);
        res.render('dashboard.ejs', { userData: req.user });
        return;
      }

    } catch (e) {
      return next(e);
    }
  });

  /* API method to pull logs from the public.etl_run_log table */
  app.get("/admin/dashboard/etl-log", async (req, res, next) => {
    try {

      let log = null;

      await pool.query('select * from etl_run_log order by time_stamp asc;', async (err, result) => {
        if (err) {
          console.log(err)
          return;
        }
        log = result.rows;
        res.json(log);
      });

    } catch (e) {
      return next(e);
    }
  });

  /* API method to get the status of the ETL job */
  app.get("/admin/dashboard/etl-status", async (req, res, next) => {
    try {

      let log = null;

      await pool.query('select * from get_etl_status();', async (err, result) => {
        if (err) {
          console.log(err)
          return;
        }
        log = result.rows;
        res.json(log);
      });

    } catch (e) {
      return next(e);
    }
  });

  /* API method to get the ETL data validation results */
  app.get("/admin/dashboard/etl-validation", async (req, res, next) => {
    try {
      let data = null;
      await pool.query('select * from etl_validate_staging_table();', async (err, result) => {
        if (err) {
          console.log(err)
          return;
        }
        data = result.rows;
        res.json(data);
      });

    } catch (e) {
      return next(e);
    }
  });

  /* API method to get database rows in use */
  app.get("/admin/dashboard/pg-rows", async (req, res, next) => {
    try {

      let log = null;

      return await pool.query('select get_database_numrows();', async (err, result) => {
        if (err) {
          console.log(err)
          return;
        }
        log = result.rows;
        res.json(log);
      });

    } catch (e) {
      return next(e);
    }
  });

  /* API method to get database space in use */
  app.get("/admin/dashboard/pg-space", async (req, res, next) => {
    try {

      let log = null;

      await pool.query('select get_database_size();', async (err, result) => {
        if (err) {
          console.log(err)
          return;
        }
        log = result.rows;
        res.json(log);
      });

    } catch (e) {
      return next(e);
    }
  });

  /* Login */
  app.get("/admin/login", userIsNotAuthenticated, (req, res) => {
    res.render("login.ejs", { message: null });
  });

  /* Register new user (NOTE: this is an admin privilege only, and is intentionally *not* outward facing) */
  app.get('/admin/register', userIsAdmin, (req, res) => {
    res.render('registerUser.ejs');
  });

  app.post('/admin/register', userIsAdmin, (req, res) => {
    const registerUser = async () => {
      try {
        const { name, role, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO production_user (name, role, email, password) VALUES ($1, $2, $3, $4)', [name, role, email, hashedPassword]
        );
        console.log(`You have succesfully registered user ${email}.`);
        res.render('dashboard');
      } catch (err) {
        console.log(err);
      }
    }
    registerUser();
  });

  /* Change password */
  /* TODO: add logic to make this work, so that if a user has a default password they are required to change it */
  app.get('/admin/changePassword', userIsAuthenticated, (req, res) => {
    res.render('changePassword.ejs');
  });


  // CHANGE PASSWORD POST ROUTE
  /*
  app.post('./admin/changePassword', userIsAuthenticated, (req, res) => {
    const { password, newPass1, newPass2 } = req.body;
    /* TODO: 
    1. check that the current password matches the password in the database

    2. check that the two new passwords match, throw an error /req.flash error message if they don't

    // if (newPass1 !== newPass2) {
      req.error('New passwords must match.');
    } else {
      const newPassword = newPass1;
    }

    3. if the new passwords match, bcrypt them:

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    
    4. store the new, bcrypted password in the DB, using "upsert"

    /* KENT: the sql command to upset the new password goes here */
    /*
  }); */
  

  /* Logout */
  app.get("/admin/logout", (req, res) => {
    req.logout();
    res.render("login.ejs", { message: "You have logged out successfully" });
  });

  /* Handle input from the login form */
  app.post(
    "/admin/login",
    passport.authenticate("local", {
      successRedirect: "/admin/dashboard",
      failureRedirect: "/admin/login",
      failureFlash: true
    })
  );

  /* Passport middleware function to protect routes */
  function userIsNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/admin/dashboard");
    }
    next();
  }

  /* Passport middleware function to protect routes */
  function userIsAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/admin/login");
  }

  //this is for the "Create User" route, which should be accesible by logged-in Admin users only
  function userIsAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.redirect("/admin/dashboard");
  }

  /* Clear all tables like public.etl_% */
  const clearTables = async () => {
    await pool.query('select etl_clear_tables();', async (err, result) => {
      if (err) {
        console.log(err)
      }
    });
  }

  /* Log a message to the database */
  const log = async message => {
    await pool.query(`select etl_log('${message}');`, async (err, result) => {
      if (err) {
        console.log(err)
      }
    });
  }

  /* Import staging data to production */
  const importToProduction = async () => {
    await pool.query(`select etl_import_to_production();`, async (err, result) => {
      if (err) {
        console.log(err);
      }
    });
  }

};

