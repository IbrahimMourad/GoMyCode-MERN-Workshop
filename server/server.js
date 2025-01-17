const express = require("express");
const port = 4000;
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes");
const Contact = require("./models/Contact");
const bodyParser = require("body-parser");

const cors = require("cors");

const passport = require("passport");
const passportSetup = require("./passport-setup");
// const session = require("cookie-session");
const expressSession = require("express-session");

const app = express();
//  mongoose config
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.connect(
  "mongodb+srv://mern-app:mern1234@cluster0.ikppq.mongodb.net/mern-contact?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, suc) {
    if (err) {
      console.log("error: " + err);
    }
    console.log(
      "open done: " + mongoose.connection.host + "\t" + mongoose.connection.port
    );
  }
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(app.router);

app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);
const maxAge = 86400000; // 1 day in milliseconds

app.use(
  expressSession({
    maxAge: maxAge,
    secret: ["keyboard cat"],
    resave: true,
    saveUninitialized: true,
    secure: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);

const display_callback = (err, result) => {
  if (err) {
    throw err;
  }
  console.log("result: " + result);
};

// app.use("/profile", profileRoutes);

app.get("/", function (req, res) {
  // req.user - will exist
  // load user orders and render them
  res.status(200);
  res.set("Content-type", "text/json");

  // console.log("logged in user: " + req.user);
  Contact.find({ userId: req.user._id }).then((contactsInfo) => {
    // <-- Update to your call of choice.
    res.send(contactsInfo);
  });
});

app.post("/addcontact", function (req, res) {
  // add email with contact

  console.log(`logged in user from add contact:  ${req.user} \n \n`);
  if (req.user === undefined) {
    res.redirect("http://localhost:3000/login");
  } else {
    Contact.create({ ...req.body, userId: req.user._id })

      .then((result) => {
        res.redirect("http://localhost:3000/");
        res.status(200);

        res.end();
      })
      .catch((err) => console.log(err + "\n"));
  }
});

app.delete("/:userId", function (req, res) {
  res.status(200);
  res.set("Content-type", "text/html");
  console.log("logged in user: " + req.user);

  Contact.findByIdAndRemove(req.params.userId).exec(function (err, result) {
    display_callback(err, result);
    res.status(200);
    res.end();
  });
});

app.put("/:contactId", function (req, res) {
  Contact.findOneAndUpdate({ _id: req.params.contactId }, req.body).exec(
    function (err, updated) {
      if (err) console.log(err);
      console.log(req.user);
      res.redirect("http://localhost:3000");
      res.end();
    }
  );
});

app.listen(port, function (err, suc) {
  if (err) console.log(err);
  console.log(
    "The server is running, " +
      " please, open your browser at http://localhost:%s",
    port
  );
});
