import { Schema, model } from "mongoose";

interface IUser {
  username: string;
  password: string;
  deposit: number;
  role: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  deposit: { type: Number, required: true },
  role: { type: String, required: true },
});

export const User = model<IUser>("User", userSchema);
