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
  password: String,
  fullname:String
});

const userAuth = mongoose.model('usercollection', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/login", function (request, response) {
  response.render("index");
});

let currentUser
app.post('/login', async function(req, res) {
  const { role, username, password } = req.body;
  try {
    currentUser = await userAuth.findOne({ username, password }).exec();
    if (currentUser) {
      // Redirect the user to the main page
      res.redirect('/dashboard')
    } else {
      // Handle case when user is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/dashboard', (req, res) => {
  if(currentUser) {
    res.render('dashboard', { name: currentUser.fullname, role: currentUser.role });
  } else {
    // Handle case when user is not found or not authenticated
    res.status(401).send('Unauthorized');
  }
  currentUser = null
});


app.listen(3000, function () {
  console.log("server started on port 3000");
});
