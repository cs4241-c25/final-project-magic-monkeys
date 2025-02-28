import { Schema, model } from "mongoose";

const movieNightSchema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    movieId: { type: Number },
    dateTime: { type: Date, required: true }
}, { timestamps: true });

export default model("MovieNight", movieNightSchema);