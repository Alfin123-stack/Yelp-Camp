const express = require("express");
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

const CampgroundsController = require("../controllers/campgrounds");

router
  .route("/")
  .get(CampgroundsController.renderIndex)
  .post(isLoggedIn, validateCampground, CampgroundsController.addNewCampground);

router.get("/new", isLoggedIn, CampgroundsController.renderAddForm);

router
  .route("/:id")
  .get(CampgroundsController.renderDetails)
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    CampgroundsController.updateCampground
  )
  .delete(isLoggedIn, CampgroundsController.deleteCampground);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  CampgroundsController.renderEditForm
);

module.exports = router;
