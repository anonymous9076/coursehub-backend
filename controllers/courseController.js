const courseModels = require("../models/courseModels");
const { CourseUpload, deleteVideos } = require("../utils/uploadFiles");

const createCourse = async (req, res) => {
  const data = req.body;
  const file = req.file.buffer;
  const userId = req.user._id || "oijv846ssoj903278fhi2398fhf";
  try {
    if (!file) {
      return res.status(400).json({ message: "No video uploaded" });
    }
    const result = await CourseUpload(file);
    const course = await courseModels.create({
      title: data.title,
      description: data.description,
      category: data.category,
      courseFile: {
        url: result.secure_url,
        public_id: result.public_id,
      },
      created_by: userId,
    });
    course.save();
    return res.status(200).json({ course });
  } catch (err) {
    return res.status(500).json({ message: "something went wrong", err: err });
  }
};

const updateCourse = async (req, res) => {
  const data = req.body || {};
  const courseId = req.params.id;
  const file = req.file.buffer;
  try {
    const course = await courseModels.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course Not Found" });
    }
    if (file) {
      if (course.courseFile?.public_id) {
        await deleteVideos(course.courseFile.public_id);
      }
      const result = await CourseUpload(file);
      const updatedCourse = await courseModels.updateOne(
        { _id: courseId },
        {
          ...data,
          courseFile: { url: result.secure_url, public_id: result.public_id },
        }
      );
      return res.status(200).json(updatedCourse);
    } else {
      const updatedCourse = await courseModels.updateOne(
        { _id: courseId },
        { ...data }
      );
      return res.status(200).json(updatedCourse);
    }
  } catch (err) {
    return res.status(500).json({ message: "something went wrong", err: err });
  }
};

const deleteCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await courseModels.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course Not Found" });
    }
    const deletedOne = await courseModels.deleteOne({ _id: courseId });

    return res
      .status(200)
      .json({ message: "Course has been deleted", deletedOne });
  } catch (err) {
    return res.status(500).json({ message: "something went wrong", err: err });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const { title, category, sort, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (title) {
      filter.title = title;
    }

    let sortOption = {};
    if (sort === "new") sortOption.createdAt = -1;
    else if (sort === "old") sortOption.createdAt = 1;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const courses = await courseModels
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    const totalCourses = await courseModels.countDocuments(filter);

    res.status(200).json({
      success: true,
      total: totalCourses,
      page: pageNumber,
      totalPages: Math.ceil(totalCourses / limitNumber),
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

const likeCourse = async (req, res) => {
  const userId = req.user._id || "hiusaghuerinfuier9856u4965hiu";
  const courseId = req.params.id;

  const course = await courseModels.findById(courseId);
  if (!course) {
    res.status(404).json("course not found");
  }

  let updated;
  if (course.liked.includes(userId)) {
    updated = await courseModels.updateOne(
      { _id: courseId },
      { $pull: { liked: userId } }
    );
  } else {
    updated = await courseModels.updateOne(
      { _id: courseId },
      { $push: { liked: userId } }
    );
  }

  res.status(200).json({ success: true, updated });
};

module.exports = { createCourse, getAllCourses,likeCourse,updateCourse, deleteCourse };
