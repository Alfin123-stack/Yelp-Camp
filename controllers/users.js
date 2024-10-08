const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

const UsersController = {
  renderRegisterForm: (req, res) => {
    res.render("users/register");
  },

  registerUser: catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Yelp Camp!");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  }),

  renderLoginForm: (req, res) => {
    res.render("users/login");
  },

  loginUser: (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || "/campgrounds"; // update this line to use res.locals.returnTo now
    res.redirect(redirectUrl);
  },

  logOutUser: (req, res) => {
    req.logout((err) => {
      if (err) {
        req.flash("error", "Error logging out. Please try again.");
        return res.redirect("/campgrounds");
      }
      req.flash("success", "Goodbye!");
      return res.redirect("/campgrounds");
    });
  },
};

module.exports = UsersController;
