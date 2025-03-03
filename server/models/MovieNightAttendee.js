import { Schema, model } from "mongoose";

const movieNightAttendeeSchema = new Schema({
    movieNightId: { type: Schema.Types.ObjectId, ref: "MovieNight", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Attended", "Absent"], default: "Attended" }
}, { timestamps: true });

movieNightAttendeeSchema.index({ movieNightId: 1, userId: 1 }, { unique: true });

export default model("MovieNightAttendee", movieNightAttendeeSchema);