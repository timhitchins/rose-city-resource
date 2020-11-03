const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");


// app and middleware
const app = express();
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

app.get("/admin/register", (req, res) => {
  res.render("register.ejs");
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

//heroku dynamic port binding
const PORT = process.env.PORT || 5000;
app.listen(PORT);