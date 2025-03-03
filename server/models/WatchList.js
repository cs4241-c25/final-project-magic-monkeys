import { Schema, model } from "mongoose";

const watchListSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: Number, required: true },
    seenMovie: { type: Boolean, default: false }
}, { timestamps: true });

watchListSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default model("WatchList", watchListSchema);