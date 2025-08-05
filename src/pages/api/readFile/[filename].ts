// pages/api/readFile/[filename].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Basic validation to allow only alphanumeric, dashes, underscores, and .txt
function isValidFilename(name: string): boolean {
  return /^[a-zA-Z0-9_\-\.]+$/.test(name);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { filename } = req.query;

  if (typeof filename !== "string" || !isValidFilename(filename)) {
    return res.status(400).json({ message: "Invalid filename." });
  }

  const filePath = path.join(process.cwd(), filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found." });
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    res.status(200).send(content); // 🔥 Plain text response
  } catch (err) {
    console.error("Error reading file:", err);
    res.status(500).json({ message: "Failed to read file." });
  }
}

