const keys = require("../config/nodeKeys")
const fetch = require("node-fetch");

module.exports = (app) => {
  app.get("/api/listings-resource", (req, res) => {
    const listingsResource = keys.NODE_LISTING_RESOURCE;
    const uri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT * from "${listingsResource}"`;

    //fetch the package resource
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