// Backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary and return the secure_url.
 * @param {Buffer} buffer  - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder name
 * @param {string} [publicId] - Optional public_id for the asset
 * @returns {Promise<string>} secure_url
 */
const uploadBufferToCloudinary = (buffer, folder = 'agaz/applications', publicId) => {
  return new Promise((resolve, reject) => {
    const opts = { folder, resource_type: 'image' };
    if (publicId) opts.public_id = publicId;

    const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
};

module.exports = { cloudinary, uploadBufferToCloudinary };
