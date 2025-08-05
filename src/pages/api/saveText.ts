import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { justification, id } = req.body;

    const filePath = path.join(process.cwd(), id.toString() + ".txt");

    fs.writeFile(filePath, justification, "utf8", (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to save file." });
      }
      res.status(200).json({ message: "File saved successfully!" });
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

