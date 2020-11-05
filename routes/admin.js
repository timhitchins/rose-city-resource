const keys = require("../config/nodeKeys");
const { spawn } = require('child_process');
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
const pool = require('./../dbConfig');
/* --- Passport modules + config  --- */
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();

module.exports = (app) => {

  /* ---- Initialize and configure passport ----- */
  const initializePassport = require("./../passportConfig");
  initializePassport(passport);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(function(req,res,next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success")
    next();
  })
  // Sets the view engine to ejs so it can render the admin view code
  app.set("view engine", "ejs");

  /* Home controller for the admin page */
  /* NOTE: you have to be logged in to access this route. For dev purposes, use "email2@gmail.com" and "password" to log in. */
  app.get("/admin/dashboard", checkNotAuthenticated, async (req, res) => {
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
  app.get("/admin/etlstatus", checkNotAuthenticated, async (req, res) => {
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

  /* ADMIN ROUTES */
  // // placeholder landing page; can be removed, but is good template code 
  // app.get('/', checkAuthenticated, (req, res) => {
  //   console.log(req.isAuthenticated())  
  //   res.render('index.ejs');
  // });
  // Kent's admin dashboard - where the ETL script can be triggered and run
  // app.get('/admin/dashboard', checkNotAuthenticated, (req, res) => {
  //   console.log(req.isAuthenticated())  
  //   res.render('admin.ejs');
  // });
  // change password
  app.get('/admin/settings', checkNotAuthenticated, (req, res) => {
    console.log(req.isAuthenticated())  
    res.render('changePassword.ejs');
  });

  // admin user login
  app.get("/admin/login", checkAuthenticated, (req, res) => {
    console.log(req.isAuthenticated())  
    // flash sets a messages variable. passport sets the error message
    console.log(req.session.flash.error);
    res.render("login.ejs");
  });

  app.get("/admin/logout", (req, res) => {
    req.logout();
    console.log(req.isAuthenticated())  
    res.render("index", { message: "You have logged out successfully" });
  });

  /* this info is from our initialize function in passportConfig.js */
  app.post(
    "/admin/login",
    passport.authenticate("local", {
      successRedirect: "/admin/dashboard",
      failureRedirect: "/admin/login",
      failureFlash: true
    })
  );
  /* Passport middleware functions that to protect routes */ 
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/admin/dashboard");
    }
    next();
  }

  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/admin/login");
  }   


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