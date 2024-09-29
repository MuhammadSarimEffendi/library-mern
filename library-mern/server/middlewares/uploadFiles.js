// middlewares/uploadMiddleware.js
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig'); // Assuming cloudinaryConfig.js is in the config folder
const fs = require('fs');
const path = require('path');

// Directory for temporary uploads
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer configuration for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter for validating file types
const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Initialize multer with storage and filters
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: fileFilter,
});

// Middleware for uploading a single image to Cloudinary
const uploadSingleToCloudinary = (req, res, next) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }

            // Path of the uploaded file
            const filePath = req.file.path;

            // Upload file to Cloudinary
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'user_avatars',
            });

            // Remove the local file after upload to Cloudinary
            fs.unlinkSync(filePath);

            // Attach Cloudinary URL to request object
            req.uploadedImage = { url: result.secure_url, id: result.public_id };
            next();
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    });
};

// Middleware for uploading multiple images to Cloudinary
const uploadMultipleToCloudinary = (req, res, next) => {
    upload.array('files', 5)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, message: "No files uploaded" });
            }

            const urls = [];

            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'user_avatars',
                });

                urls.push({ url: result.secure_url, id: result.public_id });
                
                // Remove the local file after uploading to Cloudinary
                fs.unlinkSync(file.path);
            }

            req.uploadedImages = urls;
            next();
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    });
};

module.exports = { uploadSingleToCloudinary, uploadMultipleToCloudinary };
