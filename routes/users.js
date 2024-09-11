const express = require("express");
const router = express.Router();
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

const UsersController = require("../controllers/users");

router
  .route("/register")
  .get(UsersController.renderRegisterForm)
  .post(UsersController.registerUser);

router
  .route("/login")
  .get(UsersController.renderLoginFrom)
  .post(
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    // Now we can use res.locals.returnTo to redirect the user after login
    UsersController.loginUser
  );

router.get("/logout", UsersController.logOutUser);

module.exports = router;
