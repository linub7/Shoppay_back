const cloudinary = require('../cloud');

exports.uploadImageToCloudinary = async (filePath, folderPath) => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    filePath,
    {
      folder: folderPath,
    }
  );
  return { url, public_id };
};

exports.destroyImageFromCloudinary = async (public_id) => {
  const { result } = await cloudinary.uploader.destroy(public_id);
  console.log(result);

  return result;
};
