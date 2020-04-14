const fetch = require("node-fetch");

module.exports = (app) => {
  app.get("/api/package", (req, res) => {
    const packageId = "e9c55b2c-4019-463e-8efa-622f23221402";
    const uri = `https://opendata.imspdx.org/api/3/action/package_show?id=${packageId}`;

    fetch(uri)
      .then((packageResponse) => packageResponse.json())
      .then((packageJson) => {
        res.json(packageJson);
      })
      .catch((err) => {
        res.send(err);
      });

    //fetch the data
    //     const packageRes = await fetch(uri)
    //     const packageJson = await packageRes.json()

    // res.json(packageJson)
  });
};
