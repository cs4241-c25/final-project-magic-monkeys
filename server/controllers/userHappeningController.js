import UserHappening from "../models/UserHappening.js";
import User from "../models/User.js";
import Group from "../models/Group.js"
import UserGroup from "../models/UserGroups.js"

const MAX_HAPPENINGS = 10;

export const createUserHappening = async (req, res) => {
    try {
        const { userId, happening } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const happeningCount = await UserHappening.countDocuments({ userId });
        if(happeningCount >= MAX_HAPPENINGS){
            const oldestHappening = await UserHappening.findOne({ userId }).sort({ createdAt: 1 });
            if(oldestHappening) {
                await UserHappening.findByIdAndDelete(oldestHappening._id);
            }
        }

        const newHappening = new UserHappening({ 
            userId, 
            happening,
            username: user.username
        });
        await newHappening.save();

        res.status(201).json(newHappening);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserHappeningById = async (req, res) => {
    try {
        const { id } = req.params;
        const happening = await UserHappening.findById(id).populate("userId", "username");

        if (!happening) {
            return res.status(404).json({ message: "User happening not found." });
        }

        res.status(200).json(happening);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserHappeningsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const happenings = await UserHappening.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);

        if (!happenings.length) {
            return res.status(200).json([]);
        }

        res.status(200).json(happenings);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserHappeningsByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "User not found." });
        }

        const userGroups = await UserGroup.find({ groupId }).select("userId");
        if(!userGroups.length){
            return res.status(404).json({ message: "No users found in this group." });
        }

        const userIds = userGroups.map(ug => ug.userId);

        const happenings = await UserHappening.find({ userId: { $in: userIds } })
            .sort({ createdAt: -1 })
            .populate("userId","userId username profilePicture");

        res.status(200).json(happenings);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAllUsersGroupHappenings = async (req, res) => {
    try{
        const { userId } = req.params;

        const userGroups = await UserGroup.find({ userId }).select("groupId");
        const groupIds = userGroups.map(group => group.groupId);

        if(groupIds.length === 0){
            return res.json([]);
        }

        const groupUsers = await UserGroup.find({ groupId: { $in: groupIds }, userId: { $ne: userId } })
            .select("userId");
        const userIdsInGroups = groupUsers.map(groupUser => groupUser.userId);

        if(userIdsInGroups.length === 0){
            return res.json([]);
        }

        const allHappenings = await UserHappening.find({ 
            userId: { $in: userIdsInGroups }
        })
            .sort({ createdAt: -1 })
            .lean();

        const uniqueHappenings = Array.from(new Map(
            allHappenings.map(happening => [happening._id.toString(), happening])
        ).values());

        res.json(uniqueHappenings);
    } catch (error){
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteUserHappening = async (req, res) => {
    try {
        const { id } = req.params;
        const happening = await UserHappening.findByIdAndDelete(id);

        if (!happening) {
            return res.status(404).json({ message: "User happening not found." });
        }

        res.status(200).json({ message: "User happening deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};