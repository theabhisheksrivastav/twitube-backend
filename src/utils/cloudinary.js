import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { apiResponse } from './apiResponse.js';
import { apiError } from './apiError.js';


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error('File path is required');
    }
    
    const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    console.log('Error in cloudinary upload', error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    if (!url) {
      throw new Error('Public id is required');
    }
    const response = await cloudinary.uploader.destroy(url.split('/').pop().split('.')[0]);
    return new apiResponse(200, 'Image deleted successfully', response);
  } catch (error) {
    return new apiError(400, error, 'Error in deleting image');
  }
}

export { uploadOnCloudinary, deleteFromCloudinary};
