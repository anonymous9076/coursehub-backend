const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      minlength: [3, "Title must be at least 3 characters long"],
      trim: true,
    },
    description: {
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
    courseFile: {
      url: {
        type: String,
        required: [true, "Course file URL is required"],
      },
      public_id: {
        type: String,
      },
    },
    created_by: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Courses", CourseSchema);
