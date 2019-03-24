var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

// ----- for image upload ------
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Please select an image file.'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'rhcmoore', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
    // get data from form/passport
    var name = req.body.name;
    var price = req.body.price;
    // var image = req.body.image;
    var desc = req.body.description;
    var author = { // from passport
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            console.log(err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        cloudinary.uploader.upload(req.file.path, function(result) { // image upload
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;
            var newCampground = {
                name: name,
                price: price,
                image: result.secure_url,
                description: desc,
                author: author,
                location: location,
                lat: lat,
                lng: lng
            }
            // Create a new campground and save to db
            Campground.create(newCampground, function (err, newlyCreated) {
                if (err) {
                    req.flash("error", "Please try again");
                    console.log(err);
                } else {
                    res.redirect("/campgrounds");
                }
            });
        });
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
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
            if (err) {
                req.flash('error', err.message);
                res.redirect("/campgrounds");
                console.log(err);
            } else {
                req.flash('success', 'Updated campground');
                res.redirect("/campgrounds/" + req.params.id);
            }
        })
    });
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