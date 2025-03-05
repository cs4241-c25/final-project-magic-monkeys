import { Schema, model } from "mongoose";

const groupSchema = new Schema({
    name: { type: String, required: true },
    inviteCode: { type: String, unique: true, required: true }
}, { timestamps: true });

export default model("Group", groupSchema);