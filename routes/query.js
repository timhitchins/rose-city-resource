module.exports = (app, pool) => {
  app.get("/api/query", async (req, res, next) => {
    try {

      /* Pull the listing table and parse into JSON */
      await pool.query("SELECT * FROM production_data", async (sqlerr, sqlres) => {
        if (sqlerr) {
          if (process.env.NODE_ENV == undefined || process.env.NODE_ENV !== "production") {
            try {
              await res.send(sqlerr);
            } catch (e) {
              console.error(e);
              res.sendStatus(500);
            }
          }
          return;
        }

        /* Return JSON to the client */
        await res.json(sqlres.rows);

      });
    } catch (e) {
      return next(e);
    }
  });
};