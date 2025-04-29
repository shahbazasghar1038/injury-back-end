import AWS from "aws-sdk";
import multer from "multer";
import path from "path";
import { Request } from "express";
require("dotenv").config();
// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Set the upload destination for multer
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

export const uploadFileToS3 = async (
  file: Express.Multer.File,
  bucketName: string
): Promise<string> => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read", // Set the file to be publicly readable
  };

  // Upload to S3
  const s3Response = await s3.upload(params).promise();
  return s3Response.Location; // URL of the uploaded file
};

export { upload };
