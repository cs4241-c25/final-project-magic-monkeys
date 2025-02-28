import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: Number, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviewText: { type: String, maxlength: 500 },
}, { timestamps: true });

reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default model("Review", reviewSchema);