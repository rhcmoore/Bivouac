var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// show all campgrounds
router.get("/", function (req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user });
        }
    });
});

// add new campground to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    // get data from form/passport
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = { // from passport
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {
        name: name,
        image: image,
        description: desc,
        author: author
    }
    // Create a new campground and save to DB
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            req.flash("error", "Please try again");
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

// show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

// show more info about one campground
router.get("/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) { // this is weird.
        if (err || !foundCampground) {
            console.log(err);
            req.flash("error", "Not found.");
            return res.redirect('/campgrounds');
        }
        //render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
    });
});

// show edit campground form
router.get("/:id/edit", middleware.isLoggedIn, middleware.isCampgroundOwner, function (req, res) {
    res.render("campgrounds/edit", { campground: req.campground });
});

// update campground from edit form
router.put("/:id", middleware.isCampgroundOwner, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// delete campground
router.delete("/:id", middleware.isCampgroundOwner, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err, campgroundRemoved) {
        if (err) {
            console.log(err);
            req.flash("error", "Not found.");
        }
        Comment.deleteMany({ _id: { $in: campgroundRemoved.comments } }, function (err) {
            if (err) {
                console.log(err);
            }
            res.redirect("/campgrounds");
        });
    });
});

module.exports = router;