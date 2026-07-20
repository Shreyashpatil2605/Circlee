import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow audio, video, images, and common documents
  const allowedMimeTypes = [
    "audio/",
    "video/",
    "image/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream" // fallback/raw binary
  ];

  const isAllowed = allowedMimeTypes.some((mime) => file.mimetype.startsWith(mime)) ||
    file.originalname.endsWith(".m4a") ||
    file.originalname.endsWith(".caf") ||
    file.originalname.endsWith(".mp3") ||
    file.originalname.endsWith(".wav");

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

export default upload;
