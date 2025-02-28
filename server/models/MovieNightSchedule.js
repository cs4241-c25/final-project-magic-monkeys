import { Schema, model } from "mongoose";

const movieNightScheduleSchema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    dateTime: { type: Date, required: function() { return !this.recurring; } }, // required date for one-time events
    recurring: { type: Boolean, default: false }, // true for recurring events, false for one-time events
    recurrenceDays: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], required: function() { return this.recurring }}], // days of week for recurring events
    startDate: { type: Date, required: function() { return this.recurring } }, // date that recurring events begin recurring on
    endDate: { type: Date, validate: { 
        validator: function(value) { 
            if (!value) return true;
            return this.recurring && value >= this.startDate; 
        }, message: "endDate must be after startDate" }}, // date that recurring events stop recurring on
    startTime: { type: Date, required: function() { return this.recurring } }, // time recurring events start
    duration: { type: Number, min: 1 } // how long any event lasts, one-time or recurring, stored in minutes
}, { timestamps: true });

movieNightScheduleSchema.index({ groupId: 1});

export default model("MovieNightSchedule", movieNightScheduleSchema);