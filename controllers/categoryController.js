const Category = require("../models/categoryModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

// Create Category
exports.createCategory = catchAsyncError(async (req, res, next) => {
    const { name } = req.body;

    const category = await Category.create({
        name,
        createdBy: req.user._id
    });

    res.status(201).json({
        success: true,
        category,
    });
});

// Get All Categories
exports.getAllCategories = catchAsyncError(async (req, res, next) => {
    const categories = await Category.find();

    res.status(200).json({
        success: true,
        categories,
    });
});

// Delete Category (Admin)
exports.deleteCategory = catchAsyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }

    // Check if user is admin or the creator of the category
    const isCreator = category.createdBy && category.createdBy.toString() === req.user.id;
    if (!isCreator && req.user.role !== "admin") {
        return next(new ErrorHandler("You are not authorized to delete this category", 403));
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        message: "Category Deleted Successfully",
    });
});
