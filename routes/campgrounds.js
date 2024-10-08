const express = require("express");
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const { storage } = require("../cloudinary");
const multer = require("multer");
const CampgroundsController = require("../controllers/campgrounds");

const upload = multer({ storage });

router
  .route("/")
  .get(CampgroundsController.renderIndex)
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    CampgroundsController.addNewCampground
  );

router.get("/new", isLoggedIn, CampgroundsController.renderAddForm);

router
  .route("/:id")
  .get(CampgroundsController.renderDetails)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
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
