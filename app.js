// Import modules
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/student_proctoring_db");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Define schema
const userSchema = new mongoose.Schema({
  role: String,
  username: String,
  password: String,
  fullname: String,
});
const userAuth = mongoose.model("userAuths", userSchema);

const studentSchema = new mongoose.Schema({
  fullname: String,
  usn: String,
  yearOfAdmission: String,
  modeOfAdmission: String,
  cetRank: Number,
  contactNum: String,
  dob: String,
  email: String,
  adhar: String,
  bloodGroup: String,
  facultyName: String,
  faculty: String,
  sem: String,
  fatherName: String,
  fatherOccupation: String,
  fatherQualification: String,
  fatherContactNum: String,
  fatherEmail: String,
  motherName: String,
  motherOccupation: String,
  motherQualification: String,
  motherContactNum: String,
  motherEmail: String,
  address: String,
  classX: {
    yearOfPassing: Number,
    Board: String,
    Institute: String,
    grades: String,
  },
  classXII: {
    yearOfPassing: Number,
    Board: String,
    Institute: String,
    grades: String,
  },
  BE: {
    yearOfPassing: Number,
    Board: String,
    Institute: String,
    grades: String,
  },
  sem1: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  sem2: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  sem3: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  sem4: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  sem5: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  sem6: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  sem7: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  sem8: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  supplementary1: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  supplementary2: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  supplementary3: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  supplementary4: {
    creditsRegistered: Number,
    creditsEarned: Number,
    sgpa: Number,
    file: { name: String, data: Buffer },
  },
  backlogs: [
    {
      subjectCode: String,
      subjectTitle: String,
      credits: Number,
      cleared: Boolean,
      file: { name: String, data: Buffer },
    },
  ],
  currentSemRegSub: [
    { subjectCode: String, subjectTitle: String, credits: Number },
  ],
  currentCGPA : Number,
  activityPts : { community : Number, Credits : Number, Total : Number}
});
const studentModel = mongoose.model("students", studentSchema);

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "random_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Login route
app.get("/login", function (request, response) {
  response.render("index");
});

app.post("/login", async function (req, res) {
  const { username, password } = req.body;
  try {
    const currentUser = await userAuth.findOne({ username, password }).exec();
    if (currentUser) {
      req.session.user = currentUser; // Store user data in session
      res.redirect("/dashboard");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Internal server error");
  }
});

// Dashboard route
app.get("/dashboard", async function (req, res) {
  if (req.session.user) {
    const { fullname, role, username: faculty } = req.session.user;
    const requiredData = await studentModel.find({ faculty }).exec();
    // console.log(requiredData)
    const sem7std = requiredData.filter((element) => element.sem === "7");
    const sem5std = requiredData.filter((element) => element.sem === "5");
    const sem3std = requiredData.filter((element) => element.sem === "3");
    const sem1std = requiredData.filter((element) => element.sem === "1");
    if(role === 'faculty')
    res.render("dashboard", {
      name: fullname,
      role,
      sem3std,
      sem5std,
      sem1std,
      sem7std,
    });
    if(role === 'student'){
      const {username:usn} = req.session.user
      const requiredData = await studentModel.findOne({usn}).exec()
      // console.log(requiredData)
      res.render('student_form',{requiredData,role})
    }
  } else {
    res.redirect("/login");
  }
});

// student details
app.post("/student_details", async function (req, res) {
  const requiredData = await studentModel.findOne({ usn: req.body.usn }).exec();
  // res.send(requiredData)
  // console.log(requiredData)
  res.render("studentDetails", { requiredData });
});
// app.get('/student_details', function(req,res){
//   if(!req.session.user)
//   res.redirect('/login')
// })

// Logout route

app.post('/student_form',function(req,res){
  console.log(req.body)
  res.redirect('/dashboard') 
})

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/login");
  });
});

// Start the server
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
