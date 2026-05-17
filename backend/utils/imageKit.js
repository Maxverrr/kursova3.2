const ImageKit = require('imagekit');
const axios = require('axios');
require('dotenv').config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

/**
 * Upload image from URL to ImageKit
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} fileName - Name for the uploaded file
 * @returns {Promise<string>} - URL of the uploaded image
 */
const uploadImageFromUrl = async (imageUrl, fileName) => {
  try {
    // If the URL is already an ImageKit URL, return it as is
    if (imageUrl && imageUrl.includes('ik.imagekit.io')) {
      return imageUrl;
    }

    // Fetch the image from the URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      useUniqueFileName: true
    });

    return result.url;
  } catch (error) {
    console.error('Error uploading image to ImageKit:', error);
    throw error;
  }
};

module.exports = {
  uploadImageFromUrl
};

