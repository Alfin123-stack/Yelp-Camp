const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isOwner } = require("../middleware");
const ReviewsController = require("../controllers/reviews");

router.post("/", isLoggedIn, validateReview, ReviewsController.addNewReview);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isOwner,
  ReviewsController.deleteReviews
);

module.exports = router;
