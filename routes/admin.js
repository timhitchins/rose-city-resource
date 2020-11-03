const keys = require("../config/nodeKeys");
const { Pool } = require('pg');
const { spawn } = require('child_process');
const { SSL_OP_EPHEMERAL_RSA } = require("constants");

const pool = new Pool({
  connectionString: keys.PG_CONNECTION_STRING,
  max: 1,
  ssl: { rejectUnauthorized: false }
});

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