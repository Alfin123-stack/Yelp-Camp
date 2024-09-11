const Review = require("../models/review");
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");

const ReviewsController = {
  addNewReview: catchAsync(async (req, res) => {
    const userId = req.user ? req.user._id : "";
    const campground = await Campground.findById(req.params.id);
    const review = new Review({ ...req.body.review, owner: userId });
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
  }),

  deleteReviews: catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
  }),
};

module.exports = ReviewsController;
