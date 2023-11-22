import { Schema, model } from "mongoose";

interface ISession {
	userId: string;
	sessionId: string;
}

const sessionSchema = new Schema<ISession>({
	userId: { type: String, required: true },
	sessionId: { type: String, required: true, unique: true },
});

export const Session = model<ISession>("Session", sessionSchema);
