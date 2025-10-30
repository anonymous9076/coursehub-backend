const express = require("express");
const Router = express.Router();
const {
  getAllQuestionPapers,
  createQuestionPaper,
  updateQuestionPaper,
  deleteQuestionPaper,
  likeQuestionPaper,
  
} = require("../controllers/quespaperController");
const { isAuthenticatedUser, AuthorizeRoles } = require("../middlerware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

Router.get("/question-papers", getAllQuestionPapers)
  .post(
    "/upload-question-papers",
    upload.single("questionfile"),
    isAuthenticatedUser,
    AuthorizeRoles("user"),
    createQuestionPaper
  )
  .post("/update-question-papers/:id", upload.single("questionfile"), updateQuestionPaper)
  .delete("/delete-question-papers/:id", deleteQuestionPaper)
  .put(
    "/like-question-papers/:id",
    isAuthenticatedUser,
    AuthorizeRoles("user"),
    likeQuestionPaper
  );

module.exports = Router;
