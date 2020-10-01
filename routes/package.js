const keys = require("../config/nodeKeys")
const fetch = require("node-fetch");

module.exports = (app) => {
  app.get("/api/package", (req, res) => {
    const uri = `/package_node`;

    fetch(uri)
      .then((packageResponse) => packageResponse.json())
      .then((packageJson) => {
        res.json(packageJson);
      })
      .catch((err) => {
        res.send(err);
      });

  });
};

// https://opendata.imspdx.org/api/3/action/package_show?id=592c18db-efa6-44c6-8477-4ffa4103ba94