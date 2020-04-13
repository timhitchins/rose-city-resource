// const keys = require('./config/keys');

//express
const express = require('express');
const app = express();

//cors
const cors = require('cors');
app.use(cors());


//production boilerplate
if (process.env.NODE_ENV === 'production') {
  //make sure express serves up the corret assests
  //like main.js
  app.use(express.static('client/build'));

  //serve up index.html
  //this is the catch all code
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

//heroku dynamic port binding
const PORT = process.env.PORT || 5000;
app.listen(PORT);