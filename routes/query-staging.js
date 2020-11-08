const keys = require("../config/nodeKeys")
const { Client } = require('pg');

module.exports = (app, pool) => {
  app.get("/api/query-staging", async (req, res) => {

    /* Pull the listing table and parse into JSON */
    await pool.query("SELECT * FROM public.etl_staging_1", async (sqlerr, sqlres) => {
      if (sqlerr) {
        if (process.env.NODE_ENV == undefined || process.env.NODE_ENV !== "production") {
          try {
            await res.send(sqlerr);
          } catch (e) {
            console.log(e);
          }
        }
        return;
      }

      /* Return JSON to the client */
      try {
        await res.json(sqlres.rows);
      } catch (e) {
        console.log(e)
      }

    });
  });
};