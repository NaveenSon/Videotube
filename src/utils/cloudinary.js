import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Configuration
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
  });
 
  const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const file = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    console.log("file uploaded on cloudinary", file);
    return file;
  } catch (error) {
    console.log(error)
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as upload operation got failed
  }
};

export {uploadOnCloudinary};