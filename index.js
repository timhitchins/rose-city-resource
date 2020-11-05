const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
/* passport modules and config */
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();

// const initializePassport = require("./passportConfig");

// initializePassport(passport);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());
// app.use(function(req,res,next){
//   res.locals.error = req.flash("error");
//   res.locals.success = req.flash("success")
//   next();
// })

// middleware
app.use(cors());
app.use(helmet())
app.use(helmet.hidePoweredBy({ setTo: 'Blood, Sweat and Tears' }));
app.use(compression());
// Parses details from a form
app.use(express.urlencoded({ extended: false }));
// Sets our view engine to ejs, which will render pages from the "views" folder
app.set("view engine", "ejs");

//routes
require("./routes/package")(app);
require("./routes/listings")(app);
require("./routes/phone")(app);
require("./routes/admin")(app);

//production boilerplate
if (process.env.NODE_ENV === "production") {
  //make sure express serves up the corret assests
  //like main.js
  app.use(express.static("client/build"));

  //serve up index.html
  //this is the catch all code
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//heroku dynamic port binding
const PORT = process.env.PORT || 5000;
app.listen(PORT);