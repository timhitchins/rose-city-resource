const keys = require("../config/nodeKeys")
const fetch = require("node-fetch");
const { Client } = require('pg');
require('dotenv').config();


// const nodeListingsUri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT * from "61cee891-7d0f-4ebe-b8ea-c0c8d6cb27e7"`;

module.exports = (app) => {
  app.get("/api/listings-resource", (req, res) => {
    
    const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
    
    // DATABASE_URL=$(heroku config:get DATABASE_URL -a your-app) your_process


    console.log(connectionString);
    const client = new Client()
    // await client.connect()
    // const res = await client.query('SELECT * FROM listing')
    // await client.end();

    // let str = '';  
    // res.rows.forEach((row) => {
    //   str += row.toString() + "\n"
    // });
    res.send(connectionString);
    // res.send('hi');




    // const uri = nodeListingsUri;
    // fetch(uri)
    //   .then((listingsResponse) => listingsResponse.json())
    //   .then((listingsJson) => {
    //     res.json(listingsJson);
    //   })
    //   .catch((err) => {
    //     res.send(err);
    //   });

  });
};

// https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT * from "61cee891-7d0f-4ebe-b8ea-c0c8d6cb27e7"