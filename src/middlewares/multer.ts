import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx|txt/;

  const extname = allowedTypes.test(
    file.originalname.split(".").pop()?.toLowerCase() || ""
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(), // ✅ FIXED
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});


export const uploadToCloudinary = (buffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chatapp/users" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};