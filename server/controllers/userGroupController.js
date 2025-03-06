import UserGroup from "../models/UserGroups.js";
import User from "../models/User.js";
import Group from "../models/Group.js";

export const addUserToGroup = async (req, res) => {
    try {
        const { userId, groupId, role } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        const existingMembership = await UserGroup.findOne({ userId, groupId });
        if (existingMembership) {
            return res.status(400).json({ message: "User is already a member of this group." });
        }

        const newMembership = new UserGroup({
            userId,
            groupId,
            role: role || "member"
        });

        await newMembership.save();
        res.status(201).json(newMembership);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const userGroup = await UserGroup.findById(id)
            .populate("userId", "username email profilePicture")
            .populate("groupId", "name");

        if (!userGroup) {
            return res.status(404).json({ message: "User group entry not found." });
        }

        res.status(200).json(userGroup);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const checkGroupJoinExists = async (req, res) => {
    try{
        const { userId, groupId } = req.params;
        
        const userGroup = await UserGroup.findOne({ userId, groupId });

        if(userGroup){
            return res.json({ isMember: true, joinId: userGroup._id, role: userGroup.role });
        }

        res.json({ isMember: false });
    }
    catch(error){
        res.status(500).json({ message: "Server error", error: error.message});
    }
}

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["owner", "admin", "member"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified." });
        }

        const updatedMembership = await UserGroup.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        );

        if (!updatedMembership) {
            return res.status(404).json({ message: "User group entry not found." });
        }

        res.status(200).json(updatedMembership);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeUserFromGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMembership = await UserGroup.findByIdAndDelete(id);
        if (!deletedMembership) {
            return res.status(404).json({ message: "User group entry not found." });
        }

        res.status(200).json({ message: "User removed from group successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};