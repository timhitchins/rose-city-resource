const keys = require("../config/nodeKeys")
const { Client } = require('pg');

module.exports = (app) => {
  app.get("/api/query", async (req, res) => {

    let client = new Client({
      connectionString: keys.PG_CONNECTION_STRING, ssl: { rejectUnauthorized: false }
    });
    await client.connect().catch(async error => {
      if (process.env.NODE_ENV == undefined || process.env.NODE_ENV !== "production") {
        await res.send(`error: ${error} --- connection string: ${connectionString}`).catch(e => console.log(e));;
      }
      client.end();
      return;
    });

    /* Pull the listing table and parse into JSON */
    client.query("SELECT * FROM etl_staging_1", async (sqlerr, sqlres) => {
      if (sqlerr) {
        if (process.env.NODE_ENV == undefined || process.env.NODE_ENV !== "production") {
          try {
            await res.send(sqlerr);
          } catch (e) {
            console.log(e);
          }
        }
        client.end();
        return;
      }

      /* Return JSON to the client */
      try {
        await res.json(sqlres.rows);
        await client.end();
      } catch (e) {
        console.log(e);
      }

    });
  });
};