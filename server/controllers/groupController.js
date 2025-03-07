import Group from "../models/Group.js";
import UserGroup from "../models/UserGroups.js";
import User from "../models/User.js";

import crypto from "crypto";

const generateInviteCode = async () => {
    let inviteCode;
    let isUnique = false;

    while(!isUnique){
        inviteCode = crypto.randomBytes(4).toString("hex");
        const existingGroup = await Group.findOne({ inviteCode });
        if(!existingGroup){
            isUnique = true;
        }
    }

    return inviteCode;
}

export const createGroup = async (req, res) => {
    try {
        const { name, userId } = req.body;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        const inviteCode = await generateInviteCode();

        const newGroup = new Group({ name, inviteCode });
        const savedGroup = await newGroup.save();

        const newUserGroup = new UserGroup({
            userId,
            groupId: savedGroup._id,
            role: "owner"
        });
        await newUserGroup.save();

        res.status(201).json({ group: savedGroup, userGroup: newUserGroup });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getGroupByInviteCode = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const group = await Group.findOne({ inviteCode });

        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getGroupMembers = async (req, res) => {
    try {
        const { id: groupId } = req.params;

        const userGroups = await UserGroup.find({ groupId }).populate("userId", "username email profilePicture");

        if (!userGroups.length) {
            return res.status(404).json({ message: "No members found in this group." });
        }

        res.status(200).json(userGroups.map(ug => ({
            userId: ug.userId._id,
            username: ug.userId.username,
            email: ug.userId.email,
            profilePicture: ug.userId.profilePicture,
            role: ug.role
        })));
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedGroup = await Group.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedGroup) {
            return res.status(404).json({ message: "Group not found." });
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGroup = await Group.findByIdAndDelete(id);
        
        if (!deletedGroup) {
            return res.status(404).json({ message: "Group not found." });
        }

        await UserGroup.deleteMany({ groupId: id });

        res.status(200).json({ message: "Group deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};