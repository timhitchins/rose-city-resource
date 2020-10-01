const keys = require("../config/nodeKeys")
const fetch = require("node-fetch");

const nodePhoneUri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20%224407461b-e99d-4d8e-8a44-18483aa8d13c%22`

module.exports = (app) => {
  app.get("/api/phone-resource", (req, res) => {
    const uri = nodePhoneUri;

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

// https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT * from "4407461b-e99d-4d8e-8a44-18483aa8d13c"