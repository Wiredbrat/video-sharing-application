import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


//this code is reusable on any other project as well
// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloud = async (localFilePath) => {
  try {
    if(!localFilePath) return null
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto" //it will automatically detect the type of file to be uploaded
    })
    console.log('File uploaded successfully', response.url)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath) //remove the temporary file saved on server as the file didn't upload successfully  
    return null
  }
  
}

export {uploadOnCloud}