const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const { cloudinary } = require("../cloudinary");

const CampgroundsController = {
  renderIndex: catchAsync(async (req, res) => {
    delete req.session.returnTo;
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  }),

  renderAddForm: (req, res) => {
    res.render("campgrounds/new");
  },

  addNewCampground: catchAsync(async (req, res, next) => {
    const fileImage = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    const geoData = await maptilerClient.geocoding.forward(
      req.body.campground.location,
      { limit: 1 }
    );
    const campground = new Campground({
      ...req.body.campground,
      images: fileImage,
    });
    if (geoData.features.length > 0) {
      campground.geometry = geoData.features[0].geometry;
    } else {
      req.flash("error", "Location not found!");
      return res.redirect("/campgrounds"); // Ensure to return after redirect
    }

    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  }),

  renderDetails: catchAsync(async (req, res) => {
    delete req.session.returnTo;
    const user = req.user ? req.user._id : "Guest";
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: { path: "owner" },
      })
      .populate("author");
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground, user });
  }),

  renderEditForm: catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  }),

  updateCampground: catchAsync(async (req, res) => {
    const fileImage = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });

    const geoData = await maptilerClient.geocoding.forward(
      req.body.campground.location,
      { limit: 1 }
    );

    if (geoData.features.length > 0) {
      campground.geometry = geoData.features[0].geometry;
    } else {
      req.flash("error", "Location not found!");
      return res.redirect("/campgrounds");
    }

    campground.images.push(...fileImage);
    await campground.save(); // Ensure to await this

    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }

    req.flash("success", "Successfully updated campground!");
    return res.redirect(`/campgrounds/${campground._id}`); // Ensure to return here
  }),

  deleteCampground: catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  }),
};

module.exports = CampgroundsController;
