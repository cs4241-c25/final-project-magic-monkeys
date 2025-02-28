import { Schema, model } from "mongoose";

const tierListSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: Number, required: true },
    rank: { type: String, enum: ["S","A","B","C","D","F"], required: true },
    order: { type: Number, required: true }
}, { timestamps: true });

tierListSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default model("TierList", tierListSchema);