import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRegistrationOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const RegistrationOTPSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export default (mongoose.models.RegistrationOTP as Model<IRegistrationOTP>) ||
  mongoose.model<IRegistrationOTP>("RegistrationOTP", RegistrationOTPSchema);
