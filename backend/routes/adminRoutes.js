const keys = require('../../config/nodeKeys');
const { spawn } = require('child_process');
const path = require('path');
const bcrypt = require('bcrypt');
var sanitizeHtml = require('sanitize-html');
const pool = require('../db');
const { SANITIZE_HTML_OPTIONS } = require('../../config/constants')

/* Create a router, which is a "mini app" */
/* We export it at the bottom of the file */
const express = require('express')
const router = express.Router()

// Middleware to disable caching
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache')
  next()
}
/* Every route below this line will use the noCache middleware */
router.use(noCache)
  
/* ------------ ROUTE PROTECTION MIDDLEWARE ---------------- */

// Note: req.isAuthenticated is a Passport function
const ensureLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/admin/login')
}

const ensureNotLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // Redirects need the full url
    return res.redirect('/admin/dashboard')
  }
  next();
}

/* 
  Since only one routes uses
  ensureNotLoggedIn, we call it manually here 
*/
router.get('/login', ensureNotLoggedIn, (req, res) => {
  res.render('login', { message: null })
})

/* 
  Since all other routes need to be protected by "ensureLogin"
  we mount it to the router here
*/
router.use(ensureLogin)

/* ------------ USER-FACING ROUTES ---------------- */

  //GET Routes

  /* Banner */
  router.get('/banner', (req, res) => {
    res.render('banner', { activeTab: 'banner' })
  });  

  /* Dashboard */
  router.get('/dashboard', (req, res) => {
    res.render('dashboard', { activeTab: 'data' })
  });   

  /* Home - displays dashboard content */
  router.get('/home', (req, res) => {
    res.render('dashboard', { activeTab: 'home' })
  });   

  /* User guide */
  router.get('/guide', (req, res) => {
    res.render('guide', { activeTab: 'guide' })
  });  

  /* Create new user */
  router.get('/users', (req, res) => {
    res.render('users', { activeTab: 'users'});
  });

  /* Change password */
  router.get('/settings', (req, res) => {
    res.render('settings', { activeTab: 'settings'})
  });

  /* Logout */
  router.get('/logout', (req, res) => {
    req.logout();
    res.render('login', { message: 'You have logged out successfully' })
  })

  // POST routes
  router.post('/register', async (req, res) => {
    try {
      const { name, role, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO production_user (name, role, email, password) VALUES ($1, $2, $3, $4)', 
        [name, role, email, hashedPassword]
      );
      res.render('users', { activeTab: 'users' });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  /* Change password */
  router.post('/changePassword', (req, res) => {
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
  })

    /* Set the Site Banner */
    router.post('/set-site-banner', async (req, res, next) => {

      try {
        const { content, isEnabled } = req.body;
        const cleanContent = sanitizeHtml(content, SANITIZE_HTML_OPTIONS);
  
        await pool.query('SELECT set_site_banner($1, $2);',
          [cleanContent, isEnabled === true]);
        const successString = 'Created'
        
        res.json(JSON.stringify(successString))
  
      } catch (err) {
        console.error(err);
        return next(err)
      }
  
    });



/* ------------ ETL ROUTES ---------------- */

  /* Default handler for the admin page */
  router.get(['/', '/dashboard'], async (req, res, next) => {
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
        res.render('dashboard', { userData: req.user, activeTab: 'data' });
        return;
      }

    } catch (e) {
      return next(e);
    }
  });

  /* API method to pull logs from the public.etl_run_log table */
  router.get("/dashboard/etl-log", async (req, res, next) => {
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
  router.get("/dashboard/etl-status", async (req, res, next) => {
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
  router.get("/dashboard/etl-validation", async (req, res, next) => {
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
  router.get("/dashboard/pg-rows", async (req, res, next) => {
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
  router.get("/dashboard/pg-space", async (req, res, next) => {
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
  })


/* -------------- CATCH ALL ROUTE  ---------------- */

router.get('*', (req, res) => {
  if (req.isAuthenticated()) {
    return res.render('dashboard', { activeTab: 'home', message: null})
  } else {
    return res.render('login', { message: 'Please log in to access that feature'} )
  }
})

/* -------------- HELPER FUNCTIONS ---------------- */

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

  const changePassword = (email, password) => {
    pool.query(`SELECT change_password($1, $2)`, [email, password], (err, result) => {
      if (err) {
        console.error('Error executing query ', err.stack);
      }
    });
  }

module.exports = router;

