import type { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/User";
import { generateOTP } from "@/lib/otp";
import dbConnect from "@/lib/connectDB";
import { sendEmailOtp } from "@/lib/sendOtpTemplates";
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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const otp = generateOTP();

  await RegistrationOTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  await sendEmailOtp(email, otp);

  return res.status(200).json({ message: "OTP sent to your email" });
}

export default withEncryption(handler);
