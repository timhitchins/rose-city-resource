const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
/* --- Passport modules + config  --- */
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();

const initializePassport = require("./passportConfig");

initializePassport(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


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

/* Routes for data admin users only */
/* Admin dashboard */
app.get('/admin/dashboard', (req, res) => {
  res.render('admin.ejs');
});

app.get("/admin/login", (req, res) => {
  // flash sets a messages variable. passport sets the error message
  //console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get('/admin/help', (req, res) => {
  res.render('help.ejs');
});

app.get('/admin/settings', (req, res) => {
  res.render('changePassword.ejs');
});

/* uses the info from our initialize function in passportConfig.js */
app.post(
  "/admin/login",
  passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login",
    failureFlash: true
  })
);
/* built in Passport functions that we use to protect routes */ 
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}                

//heroku dynamic port binding
const PORT = process.env.PORT || 5000;
app.listen(PORT);