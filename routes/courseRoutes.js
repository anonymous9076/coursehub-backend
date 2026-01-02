const express = require("express");
const Router = express.Router();
const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  likeCourse,
  getCourseById,
} = require("../controllers/courseController");
const { isAuthenticatedUser, AuthorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

Router.get("/get-courses", getAllCourses)
  .post(
    "/upload-course",
    isAuthenticatedUser,
    AuthorizeRoles("user", "admin"),
    upload.single("file"),
    createCourse
  )
  .post(
    "/upload-course/:id",
    isAuthenticatedUser,
    AuthorizeRoles("user", "admin"),
    upload.single("file"),
    updateCourse
  )
  .delete(
    "/delete-course/:id",
    isAuthenticatedUser,
    AuthorizeRoles("user", "admin"),
    deleteCourse
  )
  .put(
    "/like-course/:id",
    isAuthenticatedUser,
    AuthorizeRoles("user", "admin"),
    likeCourse
  )
  .get("/get-courses/:id", getCourseById);

module.exports = Router;
