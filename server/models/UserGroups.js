import { Schema, model } from "mongoose";

const userGroupSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    role: {type: String, enum: ["owner", "admin", "member"], default: "member"}
}, { timestamps: true });

userGroupSchema.index({ userId: 1, groupId: 1 }, { unique: true });

export default model("UserGroup", userGroupSchema);