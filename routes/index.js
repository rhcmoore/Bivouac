var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require('../models/user');

router.get("/", function (req, res) {
    res.render("landing");
}); 


// -------------AUTH ROUTES-------------
// registration form
router.get("/register", function (req, res) {
    res.render("register");
});

// handle sign up
router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username })
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register"); // render form again
        } 
        passport.authenticate("local")(req, res, function() {
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
    res.redirect("/campgrounds");
})

// runs before comment get/post
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;