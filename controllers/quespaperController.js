const questionModel = require("../models/quespaperModel");
const { deleteImages, QuestionUpload } = require("../utils/uploadFiles");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apifeatures");

const createQuestionPaper = catchAsyncError(async (req, res, next) => {
  const data = req.body;
  const files = req.files;
  const userId = req.user._id;

  if (!files || files.length === 0) {
    return next(new ErrorHandler("No question paper files uploaded", 400));
  }

  const uploadedFiles = [];
  for (const file of files) {
    const result = await QuestionUpload(file.buffer);
    uploadedFiles.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  const paper = await questionModel.create({
    title: data.title,
    notes: data.notes,
    category: data.category,
    questionFiles: uploadedFiles,
    created_by: userId,
  });

  return res.status(200).json({ success: true, paper });
});

const updateQuestionPaper = catchAsyncError(async (req, res, next) => {
  const data = req.body || {};
  const paperId = req.params.id;
  const files = req.files;

  const paper = await questionModel.findById(paperId);
  if (!paper) {
    return next(new ErrorHandler("Question Paper Not Found", 404));
  }

  // Ownership check
  if (paper.created_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorHandler("You are not authorized to edit this question paper", 403));
  }

  if (files && files.length > 0) {
    // Delete old images
    if (paper.questionFiles && paper.questionFiles.length > 0) {
      for (const file of paper.questionFiles) {
        if (file.public_id) {
          await deleteImages(file.public_id);
        }
      }
    }

    const uploadedFiles = [];
    for (const file of files) {
      const result = await QuestionUpload(file.buffer);
      uploadedFiles.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const updatedPaper = await questionModel.findByIdAndUpdate(
      paperId,
      {
        ...data,
        questionFiles: uploadedFiles,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, updatedPaper });
  } else {
    const updatedPaper = await questionModel.findByIdAndUpdate(
      paperId,
      { ...data },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ success: true, updatedPaper });
  }
});

const deleteQuestionPaper = catchAsyncError(async (req, res, next) => {
  const paperId = req.params.id;

  const paper = await questionModel.findById(paperId);
  if (!paper) {
    return next(new ErrorHandler("Question Paper Not Found", 404));
  }

  // Ownership check
  if (paper.created_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorHandler("You are not authorized to delete this question paper", 403));
  }

  if (paper.questionFiles && paper.questionFiles.length > 0) {
    for (const file of paper.questionFiles) {
      if (file.public_id) {
        await deleteImages(file.public_id);
      }
    }
  }

  await paper.deleteOne();

  return res.status(200).json({ success: true, message: "Question Paper has been deleted" });
});

const getAllQuestionPapers = catchAsyncError(async (req, res, next) => {
  const resultPerPage = parseInt(req.query.limit) || 10;
  const papersCount = await questionModel.countDocuments();

  const apiFeature = new ApiFeatures(questionModel.find(), req.query)
    .search("title")
    .filter();

  let papers = await apiFeature.query;
  let filteredPapersCount = papers.length;

  apiFeature.pagination(resultPerPage);

  if (req.query.sort === "new") {
    apiFeature.query = apiFeature.query.sort({ createdAt: -1 });
  } else if (req.query.sort === "old") {
    apiFeature.query = apiFeature.query.sort({ createdAt: 1 });
  }

  papers = await apiFeature.query.clone();

  res.status(200).json({
    success: true,
    total: papersCount,
    filteredCount: filteredPapersCount,
    page: parseInt(req.query.page) || 1,
    totalPages: Math.ceil(filteredPapersCount / resultPerPage),
    count: papers.length,
    data: papers,
  });
});

const likeQuestionPaper = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const paperId = req.params.id;

  const paper = await questionModel.findById(paperId);
  if (!paper) {
    return next(new ErrorHandler("Question paper not found", 404));
  }

  let updated;
  if (paper.liked.includes(userId)) {
    updated = await questionModel.findByIdAndUpdate(
      paperId,
      { $pull: { liked: userId } },
      { new: true }
    );
  } else {
    updated = await questionModel.findByIdAndUpdate(
      paperId,
      { $push: { liked: userId } },
      { new: true }
    );
  }

  res.status(200).json({ success: true, updated });
});

const getQuestionPaperById = catchAsyncError(async (req, res, next) => {
  const paper = await questionModel.findById(req.params.id);
  if (!paper) {
    return next(new ErrorHandler("Question paper not found", 404));
  }
  res.status(200).json({ success: true, data: paper });
});

module.exports = {
  createQuestionPaper,
  updateQuestionPaper,
  deleteQuestionPaper,
  getAllQuestionPapers,
  likeQuestionPaper,
  getQuestionPaperById,
};
