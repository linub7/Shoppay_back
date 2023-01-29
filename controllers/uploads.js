const asyncHandler = require('../middleware/async');
const { uploadImageToCloudinary } = require('../utils/imageUpload');

exports.uploadMultipleImages = asyncHandler(async (req, res, next) => {
  const {
    files,
    body: { path },
  } = req;

  let images = [];
  for (const file of files) {
    console.log(file?.path);
    const { url, public_id } = await uploadImageToCloudinary(file?.path, path);
    images.push({ url, public_id });
  }
  return res.json({ status: 'success', data: { data: images } });
});

exports.uploadColorImage = asyncHandler(async (req, res, next) => {
  const {
    file,
    body: { path },
  } = req;
  const { url, public_id } = await uploadImageToCloudinary(file?.path, path);

  return res.json({ status: 'success', data: { data: { url, public_id } } });
});
