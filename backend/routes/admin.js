const keys = require("../../config/nodeKeys");
const { spawn } = require('child_process');
const path = require('path');
const bcrypt = require('bcrypt');
var sanitizeHtml = require('sanitize-html');
const asyncHandler = require('express-async-handler')
const pool = require('../db')

module.exports = (app) => {
  
  // Set the path to our "views" directory
  app.set('views', path.join(__dirname, '../../admin/views'))

  /* Middleware to protect routes */
  // req.isAuthenticated is a Passport function
  function ensureLogin (req, res, next) {
    res.setHeader('Cache-Control', 'no-cache')
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/admin/login')
  }

  function ensureNotLoggedIn (req, res, next) {
    res.setHeader('Cache-Control', 'no-cache')
    if (req.isAuthenticated()) {
      return res.redirect('/admin/dashboard')
    }
    next();
  }

  /* For routes that should be accessible to admin users only */
  /* Not currently in use */
  function ensureAdmin(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache')
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next()
    }
    res.redirect('/admin/dashboard')
  }


  /* Default handler for the admin page */
  app.get(["/admin", "/admin/dashboard"], ensureLogin, async (req, res, next) => {
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
        res.setHeader('Cache-Control', 'no-cache');
        res.send('true');
        return;
      }
      else if (action === 'runprod') {

        /* The 'Import to Production' button was clicked */
        await importToProduction();
        res.setHeader('Cache-Control', 'no-cache');
        res.send('true');
        return;
      }
      else {
        res.render('dashboard', { userData: req.user, activeTab: "data" });
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
        res.setHeader('Cache-Control', 'no-cache');
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
        res.setHeader('Cache-Control', 'no-cache');
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
        res.setHeader('Cache-Control', 'no-cache');
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
        res.setHeader('Cache-Control', 'no-cache');
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
        res.setHeader('Cache-Control', 'no-cache');
        res.json(log);
      });

    } catch (e) {
      return next(e);
    }
  });

  /* Set the Site Banner */
  app.post('/admin/set-site-banner', ensureLogin, async (req, res, next) => {

    try {
      const { content, isEnabled } = req.body;
      const cleanContent = sanitizeHtml(content, {
        allowedTags: [
          "address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
          "h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
          "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
          "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
          "em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
          "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
          "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "img"
        ],
        disallowedTagsMode: 'discard',
        allowedAttributes: {
          a: [ 'href', 'name', 'target' ],
          img: [ 'src' ],
          div: [ 'style', 'class' ],
          span: [ 'style', 'class' ],
          i: [ 'style', 'class']
        },
        selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
        allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'tel' ],
        allowedSchemesByTag: {},
        allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
        allowProtocolRelative: true,
        enforceHtmlBoundary: false
      });

      await pool.query('SELECT set_site_banner($1, $2);',
        [cleanContent, isEnabled === true]);
      const successString = 'Created'
      res.setHeader('Cache-Control', 'no-cache');
      res.json(JSON.stringify(successString))

    } catch (err) {
      console.error(err);
      return next(err)
    }

  });

  /* Banner */
  app.get("/admin/banner", ensureLogin, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.render('banner', { activeTab: 'banner' });
  });  

  /* Dashboard (also currently home) */
  app.get("/admin/dashboard", ensureLogin, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.render('dashboard', { activeTab: "data" });
  });   

  /* Home (also currently dashboard) */
  app.get('/admin/home', ensureLogin, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.render('dashboard', { activeTab: 'home' });
  });   

  /* User guide */
  app.get('/admin/guide', ensureLogin, (req, res) => {
    res.render('guide', { activeTab: 'guide' });
  });  

  /* Login */
  app.get('/admin/login', ensureNotLoggedIn, (req, res) => {
    res.render('login', { message: null })
  });

  /* Register new user (NOTE: this is an admin privilege only, and is intentionally *not* outward facing) */
  app.get('/admin/register', ensureLogin, (req, res) => {
    res.render('registerUser', { activeTab: 'register'});
  });

  app.get('/admin/users', ensureLogin, (req, res) => {
    res.render('users', { activeTab: 'users'});
  });

  app.post('/admin/register', ensureLogin, (req, res) => {
    const registerUser = async () => {
      try {
        const { name, role, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO production_user (name, role, email, password) VALUES ($1, $2, $3, $4)', [name, role, email, hashedPassword]
        );
        res.render('users', { activeTab: 'users' });
      } catch (err) {
        console.error(err);
        res.sendStatus(500);
      }
    }
    registerUser();
  });

  /* Change password */
   app.get('/admin/settings', ensureLogin, (req, res) => {
    res.render('settings', { activeTab: 'settings'});
  });

  /* Handle input from the change password form */
  app.post('/admin/changePassword', ensureLogin, (req, res) => {
    try {

      const { newPass1, newPass2 } = req.body;
  
      if (newPass1 !== newPass2) {
        return res.render('settings', { 
          activeTab: 'settings', 
          message: 'Passwords must match' 
        }
      )} 

      bcrypt.hash(newPass1, 10)
      .then(hashedPassword => {
        changePassword(req.user.email, hashedPassword);
        return res.render('settings', { 
          activeTab: 'settings', 
          message: 'Success! Your password has been updated' 
        })
      })
    }
    catch (e) {
      res.sendStatus(500);
    }

  });


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

