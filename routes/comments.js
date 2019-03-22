var express = require("express");
var router = express.Router({ mergeParams: true }); // gives access to :id param from app.js route prepend
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// show new comment form
router.get("/new", middleware.isLoggedIn, function (req, res) {
    // find campground by id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
});

// handle comment post
router.post("/", middleware.isLoggedIn, function (req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Please try again");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Comment added.");
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

// display edit comment form
router.get("/:comment_id/edit", middleware.isLoggedIn, middleware.isCommentOwner, function (req, res) {
    res.render("comments/edit", { campground_id: req.params.id, comment: req.comment });
});

// handle comment update
router.put("/:comment_id", middleware.isCommentOwner, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// delete comment
router.delete("/:comment_id", middleware.isCommentOwner, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err, commentRemoved) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted.");
            res.redirect("/campgrounds/" + req.params.id);
        };
    });
});

module.exports = router;