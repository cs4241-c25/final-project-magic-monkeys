import { Schema, model } from "mongoose";

const userSchema = new Schema({
    auth0Id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, maxlength: 20, match: /^[a-zA-Z0-9_-]+$/, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, unique: true, index: true },
    bio: { type: String, maxLength: 500, default: "No bio." },
    profilePicture: { type: String, match: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/},
    pfpColor: { type: String, match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, default: "#ff5c5c"},
    favoriteMovie: { type: Number }
}, { timestamps: true });

export default model("User", userSchema);