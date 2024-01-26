//jshint esversion:6
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/users');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  role: String,
  username: String,
  password: String
});

const userAuth = mongoose.model('usercollection', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/Home", function (request, response) {
  response.render("index");
});

app.post('/Home', async function(req, res) {
  const { role, username, password } = req.body;
  console.log(role,username,password)

  try {
    const foundUser = await userAuth.findOne({ username, password }).exec();
    console.log(foundUser)
    if (foundUser) {
      // Redirect the user to the main page
      res.render(`${foundUser.role}_page`,{faculty:foundUser.toJSON().fullname})
    } else {
      // Handle case when user is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).send('Internal server error');
  }
});


app.listen(3000, function () {
  console.log("server started on port 3000");
});
