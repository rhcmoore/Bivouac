var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require('../models/user');

router.get("/", function (req, res) {
    res.render("landing");
}); 

// registration form
router.get("/register", function (req, res) {
    res.render("register");
});

// handle sign up
router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username })
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register"); // render form again
        } 
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome, " + user.username);
            res.redirect("/campgrounds");
        })
    })
});

// show login form
router.get("/login", function(req, res) {
    res.render("login");
});

// handle login
router.post("/login", passport.authenticate("local", // middleware for auth
    { 
        successRedirect:"/campgrounds", 
        failureRedirect:"/login"
    }), function(req, res) {
    console.log("req", req);
    console.log("res", res)
});

// handle logout
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged out.");
    res.redirect("/campgrounds");
})

module.exports = router;