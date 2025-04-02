import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File as FormidableFile } from "formidable";

import dbConnect from "@/lib/connectDB";
import { verifyToken } from "@/lib/token";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024,
      multiples: false,
    });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
  } catch (dbErr) {
    console.error("Database connection error:", dbErr);
    return res.status(500).json({ error: "Database connection error" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  let parsedData;
  try {
    parsedData = await parseForm(req);
  } catch (parseErr) {
    console.error("Error parsing form:", parseErr);
    return res.status(400).json({ error: "Error parsing file" });
  }

  const { files } = parsedData;
  const uploadedFile = files.file;
  if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });

  let singleFile: FormidableFile;
  if (Array.isArray(uploadedFile)) {
    singleFile = uploadedFile[0];
  } else {
    singleFile = uploadedFile;
  }

  const fileName = singleFile.originalFilename || "upload";
  const contentType = singleFile.mimetype || "application/octet-stream";

  try {
    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "chat-uploads"
    );
    if (!fs.existsSync(uploadsDir)) {
      await fsPromises.mkdir(uploadsDir, { recursive: true });
    }

    const newFileName = `${Date.now()}_${fileName}`;
    const newFilePath = path.join(uploadsDir, newFileName);

    await fsPromises.rename(singleFile.filepath, newFilePath);

    const serverUrl = process.env.SERVER_URL || "http://localhost:3000";
    const fileUrl = `${serverUrl}/uploads/chat-uploads/${newFileName}`;

    return res.status(200).json({
      success: true,
      fileUrl,
      fileName,
      contentType,
    });
  } catch (uploadErr) {
    console.error("Error storing file:", uploadErr);
    return res.status(500).json({ error: "Error storing file" });
  }
}

export default handler;
