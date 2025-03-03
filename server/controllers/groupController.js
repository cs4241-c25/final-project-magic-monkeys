import Group from "../models/Group.js";
import UserGroup from "../models/UserGroups.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;

        const newGroup = new Group({ name });
        const savedGroup = await newGroup.save();

        res.status(201).json(savedGroup);
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

export const getGroupMembers = async (req, res) => {
    try {
        const { id: groupId } = req.params;

        const userGroups = await UserGroup.find({ groupId }).populate("userId", "username email profilePicture");

        if (!userGroups.length) {
            return res.status(404).json({ message: "No members found in this group." });
        }

        res.status(200).json(userGroups.map(ug => ug.userId));
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