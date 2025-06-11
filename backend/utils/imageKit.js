const ImageKit = require('imagekit');
const axios = require('axios');

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Function to upload image to ImageKit from URL
async function uploadImageFromUrl(imageUrl, fileName) {
    try {
        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // Upload to ImageKit
        const result = await imagekit.upload({
            file: buffer,
            fileName: fileName,
            folder: '/cars'  // Optional: organize images in folders
        });

        return result.url;
    } catch (error) {
        console.error('Error uploading image to ImageKit:', error);
        throw error;
    }
}

module.exports = {
    imagekit,
    uploadImageFromUrl
}; 