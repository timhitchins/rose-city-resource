const keys = require("./config/nodeKeys");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const { Pool } = require('pg');
const app = express();
app.disable('x-powered-by');

/* Determine whether the Node.js environment is development or production */
const isProdEnvironment = process.env.NODE_ENV === "production";
const isDevEnvironment = process.env.NODE_ENV === undefined || process.env.NODE_ENV !== "production";

/* Heroku free postgres allows up to 20 concurrent connections */
const pool = new Pool({
  connectionString: keys.DATABASE_URL,
  max: 20,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', async (error, client) => {
  if (isDevEnvironment) {
    console.error(`Database pool error: ${error}; Connection string: ${keys.DATABASE_URL}`);
  }
});

/* Middleware */
app.use(compression({ filter: shouldCompress }))
function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
}
app.use(cors());
app.use(helmet.hidePoweredBy({ setTo: 'Blood, Sweat and Tears' }));
app.use(express.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  /* Add Cache-Control headers to all requests */
  const expireAfterMinutes = 60;
  const cacheControlHeaderValue = isProdEnvironment
    ? `public, max-age=${expireAfterMinutes/2 * 60}, stale-while-revalidate=${expireAfterMinutes/2 * 60}`
    : `no-cache`
  res.header('Cache-Control', cacheControlHeaderValue);
  next();
});

/* Configure view templates, which form the HTML part of the admin and login pages */
app.set("view engine", "ejs");

/* Routes */
require("./routes/query")(app, pool);
require("./routes/query-staging")(app, pool);
require("./routes/last-update")(app, pool);
require("./routes/admin")(app, pool);

/* Check for database connectivity and provide a human-friendly message on failure */
const testDatabaseQuery = () => {
  pool.query(`select last_update from production_meta`, (err, res) => {
    if (err) {
      console.error('Error connnecting to the database!');
      if (keys.DATABASE_URL === undefined || keys.DATABASE_URL === null || keys.DATABASE_URL === '') {
        console.error('Please check that the DATABASE_URL environment variable is correct. See comments in nodeKeys.js for further information.');
      }
    }
  });
}
testDatabaseQuery();

/* Default handler for requests not handled by one of the above routes */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, './client/build')), {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html'))
        res.setHeader('Cache-Control', 'no-cache'); /* ALWAYS re-validate HTML files! */
      else
        res.header('Cache-Control', `max-age=31536000`); /* Aggressively cache other static content */
      }
  });
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);