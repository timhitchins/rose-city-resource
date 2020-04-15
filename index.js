const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// app and middleware
const app = express();
app.use(cors());
app.use(helmet())
app.use(helmet.hidePoweredBy({ setTo: 'Blood, Sweat and Tears' }));


//routes
require("./routes/package")(app);
require("./routes/listings")(app);
require("./routes/phone")(app);

//production boilerplate
if (process.env.NODE_ENV === "production") {
  //make sure express serves up the corret assests
  //like main.js
  app.use(express.static("client/build"));

  //serve up index.html
  //this is the catch all code
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//heroku dynamic port binding
const PORT = process.env.PORT || 5000;
app.listen(PORT);
