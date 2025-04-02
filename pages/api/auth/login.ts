import bcrypt from "bcryptjs";
import User from "@/models/User";
import dbConnect from "@/lib/connectDB";
import { generateToken } from "@/lib/token";
import { withEncryption } from "@/lib/withEncryption";
import type { NextApiRequest, NextApiResponse } from "next";

interface LoginRequestBody {
  identifier: string;
  password: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  // Cast req.body to the expected shape
  const { identifier, password } = req.body as LoginRequestBody;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = generateToken({ userId: String(user._id) });

  return res
    .status(200)
    .json({ message: "User logged in successfully", token });
}

export default withEncryption(handler);
