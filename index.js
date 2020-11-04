const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
/* --- Passport modules + config  --- */
// const { pool } = require("./dbConfig");
// const bcrypt = require("bcrypt");
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
app.use(function(req,res,next){
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success")
  next();
})

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
/* Winter note: since this isn't being overseen by passport, I don't know how to protect it. See note below */
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

/* ADMIN ROUTES */
// placeholder landing page; can be removed, but is good template code 
app.get('/', checkAuthenticated, (req, res) => {
  console.log(req.isAuthenticated())  
  res.render('index.ejs');
});
// Kent's admin dashboard - where the ETL script can be triggered and run
app.get('/admin/dashboard', checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated())  
  res.render('admin.ejs');
});
// change password
app.get('/admin/settings', checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated())  
  res.render('changePassword.ejs');
});

// admin user login
app.get("/admin/login", checkAuthenticated, (req, res) => {
  console.log(req.isAuthenticated())  
  // flash sets a messages variable. passport sets the error message
  console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/admin/logout", (req, res) => {
  req.logout();
  console.log(req.isAuthenticated())  
  res.render("index", { message: "You have logged out successfully" });
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
    return res.redirect("/admin/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/admin/login");
}                

//heroku dynamic port binding
const PORT = process.env.PORT || 5000;
app.listen(PORT);