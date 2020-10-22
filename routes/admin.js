const keys = require("../config/nodeKeys");
const { Pool } = require('pg');
const { spawn } = require('child_process');
const { SSL_OP_EPHEMERAL_RSA } = require("constants");

const pool = new Pool({
  connectionString: keys.PG_CONNECTION_STRING,
  max: 1,
  ssl: { rejectUnauthorized: false }
});

/* HTML response template */
let template = `
  <html>
    <head>
    <title>Rose City Resource Admin Page</title>
      <link rel="stylesheet} href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
      <script>
        function runEtlScript() {

          /* Prompt for confirmation */
          let confirmation = confirm("Are you sure you want to import data?");
          if (confirmation == false){ return; }
          document.getElementById('status').innerText = 'Preparing to run import process...';

          /* Trigger the ETL process to start */
          fetch(window.location.href + '?' + new URLSearchParams({ action: 'runetl' }), { method: 'GET' })
            .catch(e=>{ document.getElementById('status').innerText = 'Failed to start import process'; })

          /* Query the server for ETL status on an interval */
          window.setInterval(async function() {

            /* Fetch and display ETL logs */
            let etlLog = await fetch(window.location.href + '/etlstatus')
              .catch(e=>{ /* Ignore */ })
            let json = await etlLog.json();
            console.log(json)
            let logDiv = document.getElementById('etl-log');
            logDiv.innerHTML = 
              json.map(L => {
                let dt = new Date(L.time_stamp);
                dt.setHours(dt.getHours() - 7);
                return '<tr><td style="color: navy;">' + dt.toLocaleTimeString() + '</td><td style="color:blue;">' + L.message + '</td></tr>'
            }).join('')

            /* Update the status message */
            const jobStart = json.filter(L => L.message === 'Job Start')
            const jobEnd = json.filter(L => L.message === 'Job End')
            if (jobStart && jobStart.length === 1){
              document.getElementById('status').innerText = 'Import process is running...';
            }
            if (jobEnd && jobEnd.length === 1){
              document.getElementById('status').innerText = 'Import completed successfully';
              clearInterval(this);
            }
          }, 10000)

        }
      </script>
    </head>
    <body class='container' style='text-align: center'>
      <div>Import Airtable data into Rose City Resource</div>
      <br/>
      <button onclick='runEtlScript()'>Import Airtable Data</button>
      <br/>
      <br/>
      <div><span id='status'></span></div>
      <br/>
      <details open>
        <summary>Logs</summary>
        <table style='margin-left: auto; margin-right: auto'>
          <tbody id='etl-log'></tbody>
        </table>
      </details>
    </body>
  </html>
`;

module.exports = (app) => {

  /* Home controller for the admin page */
  app.get("/admin", async (req, res) => {
    const { action } = req.query;

    if (action === 'runetl') {

      /* Prepare to run the ETL script */
      await clearTables();
      log('Job Start');

      /* Run the ETL script */
      const python = spawn('python3', ['ETL/main.py', keys.PG_CONNECTION_STRING]);
      python.stderr.pipe(python.stdout);
      python.stdout.on('data', data => {
        log(data.toString());
      })

    }
    else {
      res.send(template);
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