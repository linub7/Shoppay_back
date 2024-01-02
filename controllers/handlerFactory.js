const asyncHandler = require('../middleware/async');
const ApiFeature = require('../utils/ApiFeature');
const AppError = require('../utils/AppError');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const {
      params: { id },
    } = req;
    const doc = await Model.findOneAndDelete({ _id: id });

    if (!doc) {
      return next(new AppError(`Document with ${id} was not found in db`, 404));
    }

    return res.json({
      status: 'success',
      message: 'deleted',
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const {
      params: { id },
      body,
    } = req;
    if (body?.role === 'admin') {
      return next(
        new AppError(
          `You can not change a user role to admin, please select sub-admin or user.`,
          401
        )
      );
    }
    const updatedDoc = await Model.findOneAndUpdate({ _id: id }, body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDoc) {
      return next(new AppError(`Document with ${id} was not found in db`, 404));
    }
    return res.json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  });

exports.getSingleOne = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const {
      params: { id },
    } = req;

    let query = Model.findOne({ _id: id });

    if (populateOptions)
      query = Model.findOne({ _id: id }).populate(populateOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError(`Document with ${id} was not found in db`, 404));
    }
    return res.json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getAll = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const { query } = req;
    // To allow fr nested GET on reviews on tour
    let filter = {};

    // Execute Query
    const features = new ApiFeature(
      Model.find(filter).populate(populateOptions),
      query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const counts = await Model.countDocuments();

    const doc = await features.query;
    return res.json({
      status: 'success',
      result: counts,
      data: {
        data: doc,
      },
    });
  });
