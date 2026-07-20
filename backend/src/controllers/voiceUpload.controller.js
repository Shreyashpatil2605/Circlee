import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";

export const uploadMedia = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Determine media type and target folder/options
  let folder = "messages/general";
  let resourceType = "raw";

  if (file.mimetype.startsWith("audio/") || 
      file.originalname.endsWith(".m4a") || 
      file.originalname.endsWith(".caf") || 
      file.originalname.endsWith(".mp3") || 
      file.originalname.endsWith(".wav")) {
    folder = "messages/audio";
    resourceType = "video"; // Cloudinary requires 'video' resource_type for audio
  } else if (file.mimetype.startsWith("image/")) {
    folder = "messages/images";
    resourceType = "image";
  } else if (file.mimetype.startsWith("video/")) {
    folder = "messages/videos";
    resourceType = "video";
  }

  try {
    // Convert file buffer to base64
    const base64File = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      folder: folder,
      resource_type: resourceType,
    });

    // Duration can be sent by frontend in body (e.g. from the audio recorder state)
    const duration = req.body.duration ? parseFloat(req.body.duration) : 0;

    res.status(200).json({
      id: uploadResponse.public_id,
      url: uploadResponse.secure_url,
      resourceType: resourceType === "video" && folder.includes("audio") ? "audio" : resourceType,
      mimeType: file.mimetype,
      duration: duration || uploadResponse.duration || 0,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    res.status(500).json({
      error: "Failed to upload file to Cloudinary",
      details: error.message,
    });
  }
});
