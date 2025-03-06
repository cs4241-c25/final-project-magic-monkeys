import MovieNightSchedule from "../models/MovieNightSchedule.js";
import UserGroup from "../models/UserGroups.js";
import Group from "../models/Group.js";

export const createMovieNightSchedule = async (req, res) => {
    try {
        const { groupId, dateTime, recurring, recurrenceDays, startDate, endDate, startTime, duration } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        if (recurring && (!recurrenceDays || !startDate)) {
            return res.status(400).json({ message: "Recurring schedules require recurrenceDays and startDate." });
        }

        const newSchedule = new MovieNightSchedule({
            groupId,
            dateTime: recurring ? null : dateTime,
            recurring,
            recurrenceDays,
            startDate,
            endDate,
            startTime,
            duration
        });

        await newSchedule.save();
        res.status(201).json(newSchedule);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMovieNightScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await MovieNightSchedule.findById(id).populate("groupId");

        if (!schedule) {
            return res.status(404).json({ message: "Movie night schedule not found." });
        }

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMovieNightScheduleByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const userGroups = await UserGroup.find({ userId }).select("groupId");
        if (!userGroups.length) {
            return res.status(404).json({ message: "User is not in any groups." });
        }

        const groupIds = userGroups.map(ug => ug.groupId);
        const schedules = await MovieNightSchedule.find({ groupId: { $in: groupIds } });

        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMovieNightScheduleByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const schedules = await MovieNightSchedule.find({ groupId });

        if (!schedules || schedules.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateMovieNightSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedSchedule = await MovieNightSchedule.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedSchedule) {
            return res.status(404).json({ message: "Movie night schedule not found." });
        }

        res.status(200).json(updatedSchedule);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteMovieNightSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSchedule = await MovieNightSchedule.findByIdAndDelete(id);
        if (!deletedSchedule) {
            return res.status(404).json({ message: "Movie night schedule not found." });
        }

        res.status(200).json({ message: "Movie night schedule deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};