// Import necessary modules
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/users');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define user schema and model
const userSchema = new mongoose.Schema({
  role: String,
  username: String,
  password: String,
  fullname:String
});
const userAuth = mongoose.model('usercollection', userSchema);

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
  secret: 'your_secret_key', // Set a secret key for session management
  resave: false,
  saveUninitialized: true
}));

// Login route
app.get("/login", function (request, response) {
  response.render("index");
});

app.post('/login', async function(req, res) {
  const { username, password } = req.body;
  try {
    const currentUser = await userAuth.findOne({ username, password }).exec();
    if (currentUser) {
      req.session.user = currentUser; // Store user data in session
      res.redirect('/dashboard');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).send('Internal server error');
  }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if(req.session.user) {
    const { fullname, role } = req.session.user;
    res.render('dashboard', { name: fullname, role });
  } else {
    res.redirect('/login');
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

// Start the server
app.listen(3000, '192.168.168.39', function () {
  console.log("Server started on port 3000");
});
