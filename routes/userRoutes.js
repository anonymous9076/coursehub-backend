const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser
} = require("../controllers/userController");
const router = express.Router();
const { isAuthenticatedUser, AuthorizeRoles } = require("../middlerware/auth");

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, AuthorizeRoles("admin"), getAllUser);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, AuthorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, AuthorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, AuthorizeRoles("admin"), deleteUser);

router.route("/logout").get(logout);

module.exports = router;
