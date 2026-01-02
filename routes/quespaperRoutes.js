const express = require("express");
const Router = express.Router();
const {
  getAllQuestionPapers,
  createQuestionPaper,
  updateQuestionPaper,
  deleteQuestionPaper,
  likeQuestionPaper,
  getQuestionPaperById,
} = require("../controllers/quespaperController");
const { isAuthenticatedUser, AuthorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

Router.get("/question-papers", getAllQuestionPapers)
  .post(
    "/upload-question-papers",
    isAuthenticatedUser,
    AuthorizeRoles("user", "admin"),
    upload.array("files", 10),
    createQuestionPaper
  )
  .post(
    "/upload-question-papers/:id",
    isAuthenticatedUser,
    AuthorizeRoles("user", "admin"),
    upload.array("files", 10),
    updateQuestionPaper
  )
  .delete(
    "/delete-question-papers/:id",
    isAuthenticatedUser,
    AuthorizeRoles("user", "admin"),
    deleteQuestionPaper
  )
  .put(
    "/like-question-papers/:id",
    isAuthenticatedUser,
    AuthorizeRoles("user", "admin"),
    likeQuestionPaper
  )
  .get("/question-papers/:id", getQuestionPaperById);

module.exports = Router;
