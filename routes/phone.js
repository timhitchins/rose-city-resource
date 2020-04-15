const keys = require("../config/nodeKeys")
const fetch = require("node-fetch");

module.exports = (app) => {
  app.get("/api/phone-resource", (req, res) => {
    const phoneResource = keys.NODE_PHONE_RESOURCE;
    const uri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT * from "${phoneResource}"`;

    //fetch the package resource
    fetch(uri)
      .then((phoneResponse) => phoneResponse.json())
      .then((phoneJson) => {
        res.json(phoneJson);
      })
      .catch((err) => {
        res.send(err);
      });

  });
};