var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash("error", "Please login."); // would display after redirect
        res.redirect("/login");
    },

    isCampgroundOwner: function (req, res, next) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Please try again.");
                res.redirect("back"); // atypical case
            } else if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) { // if they are the author,  // comparing object vs string with mongoose
                req.campground = foundCampground;
                next();
            } else {
                req.flash("error", "Permission denied.");
                res.redirect("back");
            }
        });
    },

    isCommentOwner: function (req, res, next) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Please try again.")
                res.redirect("back"); // atypical case
            } else if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) { // comparing object vs string with mongoose
                req.comment = foundComment;
                next();
            } else {
                req.flash("error", "Permission denied.");
                res.redirect("back");
            }
        })
    }
};

module.exports = middlewareObj;
