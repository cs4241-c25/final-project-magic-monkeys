import User from "../models/User.js";
import UserGroup from "../models/UserGroups.js";
import Review from "../models/Review.js";
import TierList from "../models/TierList.js";
import WatchList from "../models/WatchList.js";

export const createUser = async (req, res) => {
    try {
        const { auth0Id, username, email, profilePicture, favoriteMovie } = req.body;

        console.log("Received request to create user: { Auth0Id: ", auth0Id," }, { Email: ", email, " }, { Username: ", username, " }");

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log("User already exists: " + existingUser);
            return res.status(400).json({ message: "Username or email already in use." });
        }

        if(!username){
            username = email.split("@")[0];
        }

        let uniqueUsername = username;
        let counter = 1;
        while(await User.findOne({ username: uniqueUsername })){
            uniqueUsername = `${username}${counter}`;
            counter++;
        }

        const newUser = new User({
            auth0Id,
            username: uniqueUsername,
            email,
            profilePicture,
            favoriteMovie,
        });

        await newUser.save();
        console.log("User created successfully: ", newUser);
        res.status(201).json(newUser);
    } catch (error) {
        console.log("Error creating user: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-auth0Id -email"); // Exclude sensitive data
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-auth0Id");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserByAuth0Id = async (req, res) => {
    try{
        const user = await User.findOne({ auth0Id: req.params.auth0Id });
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch(error){
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getUserGroups = async (req, res) => {
    try {
        const { id: userId } = req.params;

        const userGroups = await UserGroup.find({ userId }).populate("groupId");

        if (!userGroups.length) {
            return res.status(404).json({ message: "User is not in any groups." });
        }

        res.status(200).json(userGroups.map(ug => ug.groupId));
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        await UserGroup.deleteMany({ userId: id });
        await Review.deleteMany({ userId: id });
        await TierList.deleteMany({ userId: id });
        await WatchList.deleteMany({ userId: id });

        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserByUsername = async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  