const asyncHandler = require('../middleware/async');
const ApiFeature = require('../utils/ApiFeature');
const AppError = require('../utils/AppError');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const {
      params: { slug },
    } = req;
    const doc = await Model.findOneAndDelete({ slug });

    if (!doc) {
      return next(
        new AppError(`Document with ${slug} was not found in db`, 404)
      );
    }

    return res.json({
      status: 'success',
      message: 'deleted',
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const {
      params: { slug },
      body,
    } = req;
    const updatedDoc = await Model.findOneAndUpdate({ slug }, body, {
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
      params: { slug },
    } = req;

    let query = Model.findOne({ slug });

    if (populateOptions)
      query = Model.findOne({ slug }).populate(populateOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`Document with ${slug} was not found in db`, 404)
      );
    }
    return res.json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { query } = req;
    // To allow fr nested GET on reviews on tour
    let filter = {};

    // Execute Query
    const features = new ApiFeature(Model.find(filter), query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    return res.json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });
