//these ids are public facing
if (process.env.NODE_ENV === "production") {
  module.exports = {
    NODE_PACKAGE_ID: "e9c55b2c-4019-463e-8efa-622f23221402",
    NODE_LISTING_RESOURCE: "9be4623a-3c01-4b2d-9c7b-567a41abbc1c",
    NODE_PHONE_RESOURCE: "2f66ad5d-5066-49d8-846a-6751cfd23863",
    /* Heroku creates an environment variable called DATABASE_URL for postgres which is subject to change at any time by Heroku */
    /* This means we need to use the DATABASE_URL environment variable rather than hard-coding the connection string */
    PG_CONNECTION_STRING: process.env.DATABASE_URL
  };
} else {
  module.exports = {
    NODE_PACKAGE_ID: "592c18db-efa6-44c6-8477-4ffa4103ba94",
    NODE_LISTING_RESOURCE: "61cee891-7d0f-4ebe-b8ea-c0c8d6cb27e7",
    NODE_PHONE_RESOURCE: "4407461b-e99d-4d8e-8a44-18483aa8d13c",
    /* The local development postgres connection string requires manually adding environment variables */
    PG_CONNECTION_STRING: process.env.DATABASE_URL
  };
}
