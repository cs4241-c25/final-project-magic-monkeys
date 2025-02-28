import { Schema, model } from "mongoose";

const userHappeningSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    happening: { type: String, required: true }
}, { timestamps: true });

userHappeningSchema.index({ userId: 1 });

export default model("UserHappening", userHappeningSchema);