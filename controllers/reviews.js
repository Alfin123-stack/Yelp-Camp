const Review = require("../models/review");
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");

const ReviewsController = {
  addNewReview: catchAsync(async (req, res) => {
    const userId = req.user ? req.user._id : "";
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      req.flash("error", "Campground not found!");
      return res.redirect("/campgrounds");
    }

    if (!req.user) {
      req.flash("error", "You must be logged in to leave a review!");
      return res.redirect(`/campgrounds/${campground._id}`);
    }

    const review = new Review({ ...req.body.review, owner: userId });
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash("success", "Created new review!");
    return res.redirect(`/campgrounds/${campground._id}`); // Ensure to return here
  }),

  deleteReviews: catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
      req.flash("error", "Campground not found!");
      return res.redirect("/campgrounds");
    }

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Successfully deleted review");
    return res.redirect(`/campgrounds/${id}`); // Ensure to return here
  }),
};

module.exports = ReviewsController;
