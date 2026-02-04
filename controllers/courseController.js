const courseModels = require("../models/courseModels");
const { CourseUpload, deleteVideos } = require("../utils/uploadFiles");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apifeatures");

const createCourse = catchAsyncError(async (req, res, next) => {
  const data = req.body;
  const file = req.file?.buffer;
  const userId = req.user._id;

  if (!file) {
    return next(new ErrorHandler("No video uploaded", 400));
  }

  let result;
  try {
    result = await CourseUpload(file);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }

  const course = await courseModels.create({
    title: data.title,
    description: data.description,
    category: data.category,
    courseFile: {
      url: result.secure_url,
      public_id: result.public_id,
    },
    duration: Math.round(result.duration || 0), // Store rounded duration from Cloudinary
    created_by: userId,
  });

  return res.status(200).json({ success: true, course });
});

const updateCourse = catchAsyncError(async (req, res, next) => {
  const data = req.body || {};
  const courseId = req.params.id;
  const file = req.file?.buffer;

  const course = await courseModels.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course Not Found", 404));
  }

  // Ownership check
  if (course.created_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorHandler("You are not authorized to edit this course", 403));
  }

  if (file) {
    if (course.courseFile?.public_id) {
      await deleteVideos(course.courseFile.public_id);
    }
    const result = await CourseUpload(file);
    const updatedCourse = await courseModels.findByIdAndUpdate(
      courseId,
      {
        ...data,
        courseFile: { url: result.secure_url, public_id: result.public_id },
        duration: result.duration || course.duration,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ success: true, updatedCourse });
  } else {
    const updatedCourse = await courseModels.findByIdAndUpdate(
      courseId,
      { ...data },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ success: true, updatedCourse });
  }
});

const deleteCourse = catchAsyncError(async (req, res, next) => {
  const courseId = req.params.id;

  const course = await courseModels.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course Not Found", 404));
  }

  // Ownership check
  if (course.created_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorHandler("You are not authorized to delete this course", 403));
  }

  if (course.courseFile?.public_id) {
    await deleteVideos(course.courseFile.public_id);
  }

  await course.deleteOne();

  return res.status(200).json({ success: true, message: "Course has been deleted" });
});

const getAllCourses = catchAsyncError(async (req, res, next) => {
  const resultPerPage = parseInt(req.query.limit) || 10;
  const coursesCount = await courseModels.countDocuments();

  const apiFeature = new ApiFeatures(courseModels.find(), req.query)
    .search("title")
    .filter()

  let courses = await apiFeature.query;
  let filteredCoursesCount = courses.length;

  apiFeature.pagination(resultPerPage);

  // Sorting
  if (req.query.sort === "new") {
    apiFeature.query = apiFeature.query.sort({ createdAt: -1 });
  } else if (req.query.sort === "old") {
    apiFeature.query = apiFeature.query.sort({ createdAt: 1 });
  }

  courses = await apiFeature.query.clone();

  res.status(200).json({
    success: true,
    total: coursesCount,
    filteredCount: filteredCoursesCount,
    page: parseInt(req.query.page) || 1,
    totalPages: Math.ceil(filteredCoursesCount / resultPerPage),
    count: courses.length,
    data: courses,
  });
});

const likeCourse = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const courseId = req.params.id;

  const course = await courseModels.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  let updated;
  if (course.liked.includes(userId)) {
    updated = await courseModels.findByIdAndUpdate(
      courseId,
      { $pull: { liked: userId } },
      { new: true }
    );
  } else {
    updated = await courseModels.findByIdAndUpdate(
      courseId,
      { $push: { liked: userId } },
      { new: true }
    );
  }

  res.status(200).json({ success: true, updated });
});

const getCourseById = catchAsyncError(async (req, res, next) => {
  const course = await courseModels.findById(req.params.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }
  res.status(200).json({ success: true, data: course });
});

module.exports = {
  createCourse,
  getAllCourses,
  likeCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
};
