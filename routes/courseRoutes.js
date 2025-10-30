const express = require("express");
const Router = express.Router();
const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  likeCourse,
} = require("../controllers/courseController");
const { isAuthenticatedUser, AuthorizeRoles } = require("../middlerware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

Router.get("/get-courses", getAllCourses)
  .post(
    "/upload-course",
    upload.single("coursefile"),
    isAuthenticatedUser,
    AuthorizeRoles("user"),
    createCourse
  )
  .post("/update-course/:id", upload.single("coursefile"), updateCourse)
  .delete("/delete-course/:id", deleteCourse)
  .put(
    "/like-course/:id",
    isAuthenticatedUser,
    AuthorizeRoles("user"),
    likeCourse
  );

module.exports = Router;
