const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

//email rooter

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "paul.b@numa.co",
    pass: "Philouchou2114"
  }
});

transporter
  .sendMail({
    from: `"test_paul" <projectOne@paul.co>`,
    to: ``,
    subject: "test_paul",
    html: "lol"
  })
  .then()
  .catch();

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

router.get("/login", (req, res, next) => {
  res.render("auth/login", { message: req.flash("error") });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let token = "";
    for (let i = 0; i < 30; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }
    const confirmationCode = token;

    const newUser = new User({
      username,
      email,
      password: hashPass,
      confirmationCode
    });

    newUser
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch(err => {
        res.render("auth/signup", console.log(err));
      });

    //send email

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "paul.b@numa.co",
        pass: "Philouchou2114"
      }
    });

    transporter
      .sendMail({
        from: transporter.user,
        to: req.body.email,
        subject: "test_paul",
        html:
          "http://localhost:3000/auth/confirm/THE-CONFIRMATION-CODE-OF-THE-USER        "
      })
      .then(info => res.render(info))
      .catch();
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
