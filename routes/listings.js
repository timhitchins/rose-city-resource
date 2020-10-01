const keys = require("../config/nodeKeys")
const fetch = require("node-fetch");

module.exports = (app) => {
  app.get("/api/listings-resource", (req, res) => {
    const uri = `/listings_node`;

    fetch(uri)
      .then((listingsResponse) => listingsResponse.json())
      .then((listingsJson) => {
        res.json(listingsJson);
      })
      .catch((err) => {
        res.send(err);
      });

  });
};

// https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT * from "61cee891-7d0f-4ebe-b8ea-c0c8d6cb27e7"