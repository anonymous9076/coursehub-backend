const mongoose = require("mongoose");

const SavedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses", 
      },
    ],
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questions", 
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Saved", SavedSchema);
