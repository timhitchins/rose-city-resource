require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const app = express();
app.disable('x-powered-by');
const db = require('./db')

/* Determine whether the Node.js environment is development or production */
const isProdEnvironment = process.env.NODE_ENV === "production";

/* Middleware */
app.use(compression({ filter: shouldCompress }))
function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res)
}
app.use(cors());
app.use(helmet.hidePoweredBy({ setTo: 'Blood, Sweat and Tears' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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
const adminRoutes = require('./routes/adminRoutes')

require("./routes/query")(app, db);
require("./routes/query-staging")(app, db);
require("./routes/meta-information")(app, db);
require("./routes/authRoutes")(app, db);
app.use('/admin', adminRoutes)

/* Default handler for requests not handled by one of the above routes */
if (process.env.NODE_ENV === "production") {
  const frontEndPath = path.join(__dirname, "/../frontend/build");
  const staticOptions = {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html'))
        res.setHeader('Cache-Control', 'no-cache'); /* ALWAYS re-validate HTML files! */
      else
        res.header('Cache-Control', `max-age=31536000`); /* Aggressively cache other static content */
    }
  }
  app.use(express.static(frontEndPath, staticOptions))
  app.use("*", express.static(frontEndPath, staticOptions))
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);