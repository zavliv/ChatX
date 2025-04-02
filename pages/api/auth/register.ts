import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/User";
import dbConnect from "@/lib/connectDB";
import RegistrationOTP from "@/models/RegistrationOTP";
import { withEncryption } from "@/lib/withEncryption";

type Data = {
  message?: string;
  error?: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  const { email, username, password, otp } = req.body;

  if (!email || !username || !password || !otp) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const regOtpRecord = await RegistrationOTP.findOne({ email, otp });
  if (!regOtpRecord) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    email,
    username,
    password: hashedPassword,
    verified: true,
  });

  await RegistrationOTP.deleteOne({ email });

  return res.status(200).json({ message: "User registered successfully" });
}

export default withEncryption(handler);
