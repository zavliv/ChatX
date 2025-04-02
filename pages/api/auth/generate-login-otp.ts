import User from "@/models/User";
import dbConnect from "@/lib/connectDB";
import { generateOTP } from "@/lib/otp";
import { withEncryption } from "@/lib/withEncryption";
import type { NextApiRequest, NextApiResponse } from "next";

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

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "User does not exist" });
  }

  const otp = generateOTP();
  user.otp = otp;
  await user.save();

  console.log(`Login OTP for ${email}: ${otp}`);

  return res.status(200).json({ message: "OTP sent to your email/phone" });
}

export default withEncryption(handler);
