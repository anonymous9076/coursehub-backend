const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      minlength: [3, "Title must be at least 3 characters long"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    liked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    questionFile: {
      url: {
        type: String,
        required: [true, "Question file URL is required"],
      },
      public_id: {
        type: String, 
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Questions", QuestionSchema);
