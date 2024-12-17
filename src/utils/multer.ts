import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

// Define Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pupil-profile-pictures', // Folder where images will be stored in Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg'], // Acceptable file types
  },
});

// Initialize Multer with Cloudinary storage
const upload = multer({ storage });

export default upload;
