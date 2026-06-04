const ImageKit = require('imagekit');
const axios = require('axios');
require('dotenv').config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const BG_REMOVE_TRANSFORMATION = 'tr:e-bgremove';

const withBackgroundRemoval = (imageUrl) => {
  if (!imageUrl || imageUrl.includes(BG_REMOVE_TRANSFORMATION)) {
    return imageUrl;
  }

  const [baseUrl, queryString] = imageUrl.split('?');
  const endpoint = (process.env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');

  if (endpoint && baseUrl.startsWith(endpoint)) {
    const imagePath = baseUrl.slice(endpoint.length).replace(/^\//, '');
    return `${endpoint}/${BG_REMOVE_TRANSFORMATION}/${imagePath}${queryString ? `?${queryString}` : ''}`;
  }

  const marker = 'ik.imagekit.io/';
  const markerIndex = baseUrl.indexOf(marker);
  if (markerIndex !== -1) {
    const pathStart = baseUrl.indexOf('/', markerIndex + marker.length);
    if (pathStart !== -1) {
      return `${baseUrl.slice(0, pathStart)}/${BG_REMOVE_TRANSFORMATION}${baseUrl.slice(pathStart)}${queryString ? `?${queryString}` : ''}`;
    }
  }

  return imageUrl;
};

/**
 * Upload image from URL to ImageKit
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} fileName - Name for the uploaded file
 * @returns {Promise<string>} - ImageKit URL with background removal transformation
 */
const uploadImageFromUrl = async (imageUrl, fileName) => {
  try {
    // If the URL is already an ImageKit URL, save the transformed URL directly.
    if (imageUrl && imageUrl.includes('ik.imagekit.io')) {
      return withBackgroundRemoval(imageUrl);
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

    return withBackgroundRemoval(result.url);
  } catch (error) {
    console.error('Error uploading image to ImageKit:', error);
    throw error;
  }
};

module.exports = {
  uploadImageFromUrl,
  withBackgroundRemoval
};
