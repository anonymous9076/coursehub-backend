const questionModel = require("../models/quespaperModel");
const { deleteImages, QuestionUpload } = require("../utils/uploadFiles");

const createQuestionPaper = async (req, res) => {
  const data = req.body;
  const file = req.file?.buffer;
  const userId = req.user._id || "defaultUser123";

  try {
    if (!file) {
      return res.status(400).json({ message: "No question paper file uploaded" });
    }

    const result = await QuestionUpload(file);

    const paper = await questionModel.create({
      title: data.title,
      notes: data.notes,
      category: data.category,
      questionFile: {
        url: result.secure_url,
        public_id: result.public_id,
      },
      created_by: userId,
    });

    paper.save();
    return res.status(200).json({ paper });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", err: err });
  }
};

const updateQuestionPaper = async (req, res) => {
  const data = req.body || {};
  const paperId = req.params.id;
  const file = req.file?.buffer;

  try {
    const paper = await questionModel.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: "Question Paper Not Found" });
    }

    if (file) {
      if (paper?.questionFile?.public_id) {
        await deleteImages(paper.questionFile.public_id);
      }

      const result = await QuestionUpload(file);
      const updatedPaper = await questionModel.updateOne(
        { _id: paperId },
        {
          ...data,
          questionFile: { url: result.secure_url, public_id: result.public_id },
        }
      );

      return res.status(200).json(updatedPaper);
    } else {
      const updatedPaper = await questionModel.updateOne(
        { _id: paperId },
        { ...data }
      );
      return res.status(200).json(updatedPaper);
    }
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", err: err });
  }
};

const deleteQuestionPaper = async (req, res) => {
  const paperId = req.params.id;

  try {
    const paper = await questionModel.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: "Question Paper Not Found" });
    }

    if (paper.questionFile?.public_id) {
      await deleteImages(paper.questionFile.public_id);
    }

    const deletedOne = await questionModel.deleteOne({ _id: paperId });

    return res
      .status(200)
      .json({ message: "Question Paper has been deleted", deletedOne });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", err: err });
  }
};

const getAllQuestionPapers = async (req, res) => {
  try {
    const { title, category, sort, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (title) filter.title = title;

    let sortOption = {};
    if (sort === "new") sortOption.createdAt = -1;
    else if (sort === "old") sortOption.createdAt = 1;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const papers = await questionModel
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    const totalPapers = await questionModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      total: totalPapers,
      page: pageNumber,
      totalPages: Math.ceil(totalPapers / limitNumber),
      count: papers.length,
      data: papers,
    });
  } catch (error) {
    console.error("Error fetching question papers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question papers",
      error: error.message,
    });
  }
};

const likeQuestionPaper = async (req, res) => {
  const userId = req.user._id || "defaultUser123";
  const paperId = req.params.id;

  const paper = await questionModel.findById(paperId);
  if (!paper) {
    return res.status(404).json("Question paper not found");
  }

  let updated;
  if (paper.liked.includes(userId)) {
    updated = await questionModel.updateOne(
      { _id: paperId },
      { $pull: { liked: userId } }
    );
  } else {
    updated = await questionModel.updateOne(
      { _id: paperId },
      { $push: { liked: userId } }
    );
  }

  res.status(200).json({ success: true, updated });
};

module.exports = {
  createQuestionPaper,
  updateQuestionPaper,
  deleteQuestionPaper,
  getAllQuestionPapers,
  likeQuestionPaper,
};
