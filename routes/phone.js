const keys = require("../config/nodeKeys")
const { Client } = require('pg');

/*
  ISSUE-10 WORK IN PROGRESS
  TODO: this comment can be removed once no longer needed
  Original data source (Northwest Open Data Exchange) which returns JSON:
  https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20%224407461b-e99d-4d8e-8a44-18483aa8d13c%22
*/

module.exports = (app) => {
  app.get("/api/phone-resource", async (req, res) => {

    // Source the connection string from environment variables
    // Heroku updates these variables when it makes changes (and this information WILL change)
    // TODO: we can probably just use process.env.DATABASE_URL
    const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

    // Connect to the database
    let client = new Client({
      connectionString: connectionString, ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    // Pull the listing table and parse into JSON
    client.query('SELECT * from public.phone;', async (sqlerr, sqlres) => {
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
          sql: "SELECT * from public.phone"
        }
      };

      // Return JSON to the client
      await res.json(json);
      await client.end();
    });
  });
};