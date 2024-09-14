const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
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
    const campground = new Campground({
      ...req.body.campground,
      images: fileImage,
    });
    //   const geoData = await geocoder.forwardGeocode({
    //     query: req.body.campground.location,
    //     limit: 1
    // }).send()
    // const campground = new Campground(req.body.campground);
    // campground.geometry = geoData.body.features[0].geometry
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
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
    console.log(req.body);
    const fileImage = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
      // images: fileImage,
    });
    campground.images.push(...fileImage);
    campground.save();
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  }),

  deleteCampground: catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  }),
};

module.exports = CampgroundsController;
