/* This is the * only * database connection.
  All other files should import and use these functions
  for all database calls 
*/
const { Pool } = require('pg')
require('dotenv').config()
const keys = require("../config/nodeKeys");

/* Determine whether the Node.js environment is development or production */
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

// Sanity check for devs that will alert you if you're missing the database connection string
(() => {
  pool.query(`SELECT last_update from production_meta`, (err, res) => {
    if (res) console.log('Connected to Heroku Postgres')
    if (err) { console.error('Error connnecting to the database!');
      if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === null || process.env.DATABASE_URL === '') {
        console.error('Please check that the DATABASE_URL environment variable is correct')
      }
    }
})})();

module.exports = pool;