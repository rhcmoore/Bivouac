var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please login."); // would display after redirect
    res.redirect("/login");
};

middlewareObj.isCampgroundOwner = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err) {
                req.flash("error", "Please try again.");
                res.redirect("back"); // atypical case
            } else {
                // if they are the author
                if (foundCampground.author.id.equals(req.user._id)) { // comparing object vs string with mongoose
                    next();
                } else {
                    req.flash("error", "Permission denied.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login.");
        res.redirect("back");
    }
};

middlewareObj.isCommentOwner = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back"); // atypical case
            } else {
                if (foundComment.author.id.equals(req.user._id)) { // comparing object vs string with mongoose
                    next();
                } else {
                    req.flash("error", "Permission denied.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login.");
        res.redirect("back");
    }
};

module.exports = middlewareObj;