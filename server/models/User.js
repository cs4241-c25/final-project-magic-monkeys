import { Schema, model } from "mongoose";

const userSchema = new Schema({
    auth0Id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, maxlength: 20, match: /^[a-zA-Z0-9_-]+$/, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, unique: true, index: true },
    profilePicture: { type: String, match: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/, default: "https://example.com/default-pfp.png"},
    favoriteMovie: { type: Number }
}, { timestamps: true });

export default model("User", userSchema);