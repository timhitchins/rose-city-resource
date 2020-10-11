const keys = require("../config/nodeKeys")
const { Client } = require('pg');

module.exports = (app) => {
  app.get("/api/listings-resource", async (req, res) => {

    // Connect to the database
    let client = new Client({
      connectionString: keys.PG_CONNECTION_STRING, ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    // Pull the listing table and parse into JSON
    client.query('SELECT * from public.listing;', async (sqlerr, sqlres) => {
      if (sqlerr) { /* TODO: remove res.send() for production and log instead */ await res.send(sqlerr); client.end(); return; }

      // Shape the JSON data to match the format of NODE
      // The client application still expects the data to match this format
      // TODO: if the client only needs the records we can just return those and tweak api.js
      let json = {
        help: "https://opendata.imspdx.org/api/3/action/help_show?name=datastore_search_sql",
        success: true,
        result: {
          records: sqlres.rows,
          fields: [{ "type": "int4", "id": "_id" }, { "type": "tsvector", "id": "_full_text" }, { "type": "text", "id": "id" }, { "type": "text", "id": "general_category" }, { "type": "text", "id": "main_category" }, { "type": "text", "id": "parent_organization" }, { "type": "text", "id": "listing" }, { "type": "text", "id": "service_description" }, { "type": "text", "id": "covid_message" }, { "type": "text", "id": "emergency_message" }, { "type": "text", "id": "street" }, { "type": "text", "id": "street2" }, { "type": "text", "id": "city" }, { "type": "text", "id": "postal_code" }, { "type": "text", "id": "website" }, { "type": "text", "id": "hours" }, { "type": "text", "id": "lon" }, { "type": "text", "id": "lat" }],
          sql: "SELECT * from public.listing"
        }
      };

      // Return JSON to the client
      await res.json(json);
      await client.end();

    });
  });
};