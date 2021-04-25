const keys = require("../../config/nodeKeys");
const { spawn } = require('child_process');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require('path');
const bcrypt = require('bcrypt');
const { env } = require("process");

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

  /* Configure view templates, which form the HTML part of the admin and login pages */
  app.set("view engine", "ejs");

  /* Default handler for the admin page */
  app.get("/admin/dashboard", userIsAuthenticated, async (req, res, next) => {
    try {

      const { action } = req.query;

      if (action === 'runetl') {
        /* The 'Import to Staging' button was clicked */

        /* Prepare to run the ETL script */
        await clearTables().catch(e => console.error('Error clearing tables from Node.js', e.stack));
        log('Job Start');

        /* Run the ETL script */
        const file = path.resolve('../etl/main.py');
        const python = spawn('python3', [file, keys.DATABASE_URL]);
        python.on('spawn', (code) => {
          console.info('Python spawn: ' + code)
        })
        python.on('error', (err) => {
          console.error('Python error: ' + err)
        })
        python.on('exit', (code) => {
          console.info('Python exit code: ' + code)
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
        res.render('../../admin/views/dashboard.ejs', { userData: req.user });
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

      await pool.query('SELECT * FROM etl_run_log ORDER BY time_stamp ASC;', async (err, result) => {
        if (err) {
          console.error('Error executing query ', err.stack);
          res.sendStatus(500);
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

      await pool.query('SELECT * FROM get_etl_status();', async (err, result) => {
        if (err) {
          console.error('Error executing query ', err.stack);
          res.sendStatus(500);
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
      await pool.query('SELECT * FROM etl_validate_staging_table();', async (err, result) => {
        if (err) {
          console.error('Error executing query ', err.stack);
          res.sendStatus(500);
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

      return await pool.query('SELECT get_database_numrows();', async (err, result) => {
        if (err) {
          console.error('Error executing query ', err.stack);
          res.sendStatus(500);
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

      await pool.query('SELECT get_database_size();', async (err, result) => {
        if (err) {
          console.error('Error executing query ', err.stack);
          res.sendStatus(500);
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
    res.render("../../admin/views/login.ejs", { message: null });
  });

  /* Register new user (NOTE: this is an admin privilege only, and is intentionally *not* outward facing) */
  app.get('/admin/register', userIsAdmin, (req, res) => {
    res.render('../../admin/views/registerUser.ejs');
  });

  app.post('/admin/register', userIsAdmin, (req, res) => {
    const registerUser = async () => {
      try {
        const { name, role, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO production_user (name, role, email, password) VALUES ($1, $2, $3, $4)', [name, role, email, hashedPassword]
        );
        res.render('../../admin/views/dashboard');
      } catch (err) {
        console.error(err);
        res.sendStatus(500);
      }
    }
    registerUser();
  });

  /* Change password */
   app.get('/admin/changePassword', userIsAuthenticated, (req, res) => {
    res.render('../../admin/views/changePassword.ejs');
  });

  /* Handle input from the change password form */
  app.post('/admin/changePassword', userIsAuthenticated, (req, res) => {
    const { newPass1, newPass2 } = req.body;
 
    let newPassword = '';
    if (newPass1 !== newPass2) {
      req.error('New passwords must match');
    } else {
      newPassword = newPass1;
    }

    try {
      bcrypt.hash(newPassword, 10)
      .then(hashedPassword => {
        changePassword(req.user.email, hashedPassword);
        res.redirect("/admin/dashboard");
      })
    }
    catch (e) {
      res.sendStatus(500);
    }

  });

  /* Logout */
  app.get("/admin/logout", (req, res) => {
    req.logout();
    res.render("../../admin/views/login.ejs", { message: "You have logged out successfully" });
  });

  /* Handle input from the login form */
  app.post("/admin/login",
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
    await pool.query('SELECT etl_clear_tables();', async (err, result) => {
      if (err) {
        console.error('Error executing query ', err.stack);
      }
    });
  }

  /* Log a message to the database */
  const log = async message => {
    await pool.query(`SELECT etl_log($1);`, [message], async (err, result) => {
      if (err) {
        console.error('Error executing query ', err.stack);
      }
    });
  }

  /* Import staging data to production */
  const importToProduction = async () => {
    await pool.query(`SELECT etl_import_to_production();`, async (err, result) => {
      if (err) {
        console.error('Error executing query ', err.stack);
      }
    });
  }

    /* Change password */
    const changePassword = async (email, password) => {
      await pool.query(`SELECT change_password($1, $2)`, [email, password], async (err, result) => {
        if (err) {
          console.error('Error executing query ', err.stack);
        }
      });
    }
};

