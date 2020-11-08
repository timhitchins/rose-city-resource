const keys = require("./config/nodeKeys");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  connectionString: keys.PG_CONNECTION_STRING,
  max: 18,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', async (error, client) => {
  if (process.env.NODE_ENV === undefined || process.env.NODE_ENV !== "production") {
    console.log(`pool.error: ${error}; connection.string: ${keys.PG_CONNECTION_STRING}`);
  }
});

/* Middleware */
app.use(cors());
app.use(helmet())
app.use(helmet.hidePoweredBy({ setTo: 'Blood, Sweat and Tears' }));
app.use(compression());
app.use(express.urlencoded({ extended: false }));

/* Configure view templates, which form the HTML part of the admin and login pages */
app.set("view engine", "ejs");

/* Routes */
require("./routes/query")(app, pool);
require("./routes/query-staging")(app, pool);
require("./routes/last-update")(app, pool);
require("./routes/admin")(app, pool);

/* Default handler for requests not handled by one of the above routes */
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);