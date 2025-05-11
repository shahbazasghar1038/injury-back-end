import AWS from "aws-sdk";
import { Request } from "express";
require("dotenv").config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  bucketName: string
): Promise<string> => {
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}.jpg`; // Generate a unique file name
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: "image/jpeg", // Set the content type, adjust as needed
    ACL: "public-read", // Set the file to be publicly readable
  };

  // Upload to S3
  const s3Response = await s3.upload(params).promise();
  return s3Response.Location; // Return the URL of the uploaded file
};
