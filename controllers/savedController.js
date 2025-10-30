const Saved = require("../models/savedModel");
const courseModel = require("../models/courseModels");
const questionModel = require("../models/quespaperModel");

const getSavedItems = async (req, res) => {
  try {
    const userId = req.user._id;

    const savedDoc = await Saved.findOne({ userId })
      .populate("courses")   
      .populate("questions"); 

    if (!savedDoc) {
      return res.status(404).json({ message: "No saved items found" });
    }

    res.status(200).json({
      success: true,
      data: savedDoc,
    });

  } catch (err) {
    console.error("Error fetching saved items:", err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
};

const toggleSavedItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;
    const { type } = req.body; 

    if (!["course", "question"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    let savedDoc = await Saved.findOne({ userId });
    if (!savedDoc) {
      savedDoc = await Saved.create({ userId, courses: [], questions: [] });
    }

    const field = type === "course" ? "courses" : "questions";

    if (savedDoc[field].includes(itemId)) {
      savedDoc[field] = savedDoc[field].filter(id => id.toString() !== itemId);
    } else {
      savedDoc[field].push(itemId);
    }

    await savedDoc.save();

    res.status(200).json({
      success: true,
      message: `${type} ${savedDoc[field].includes(itemId) ? "saved" : "removed"} successfully`,
      data: savedDoc
    });

  } catch (err) {
    console.error("Error saving item:", err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
};


module.exports = { getSavedItems,toggleSavedItem };