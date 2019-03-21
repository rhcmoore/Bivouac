var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override");
    User = require("./models/user")
    // seedDB = require("./seeds");

// routes
var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes = require("./routes/comments"),
    authRoutes = require("./routes/index");

// setup
mongoose.connect("mongodb://localhost/bivouac");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// seedDB();

// Passport config
app.use(require("express-session")({
    secret: "Secret here",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user; // passes user data to each template
    next();
});

// routing
app.use("/campgrounds/", campgroundRoutes);
app.use("/campgrounds/:id/comments/", commentRoutes);
app.use("/", authRoutes);

app.listen(3000, process.env.IP, function () {
    console.log("The Bivouac Server Has Started!");
});