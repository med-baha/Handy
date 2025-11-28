import { profile } from "console";
import user from "../models/User.js";
import { getAuth, clerkClient } from "@clerk/express";
// Controller functions

export const updateUser = async (req, res) => {
  const { userId } = getAuth(req)
  const userData = req.body
  const authuser = clerkClient.users.getUser(userId)
  console.log(userData)
  if (!authuser) {
    return res.status(401).json({ message: "Unauthorized !" })
  }
  try {
    if (userData.is_handy) {
      const updatedUser = await user.findOneAndUpdate({ clerk_id: userId },
        {
          profilepic: userData.profilePicture,
          specialty: userData.specialty,
          is_handy: true,
          description: userData.description
        })
      console.log(updatedUser)
      return res.status(200).json(updatedUser)
    }
    else {
      const updatedUser = await user.findOneAndUpdate({ clerk_id: userId }
        , {
          profilepic: userData.profilePicture,
          is_handy: false,
          is_company: userData.is_company,
        })
      console.log(updatedUser)

      return res.status(200).json(updatedUser)

    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error })

  }
}
export const updateUserProfile = async (req, res) => {
  const { id } = req.params
  const userData = req.body
  console.log(userData)
  try {
    const updatedProfile = await user.findOneAndUpdate({ _id: id }, {
      name: userData.name,
      description: userData.description,
      specialty: userData.specialty,

    }, { new: true })
    return res.status(200).json(updatedProfile)
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
}
export const getUser = async (req, res) => {
  try {
    // extract id from URL params
    const { id } = req.params;

    // find user in MongoDB by ID
    const currentUser = await user.findOne({ clerk_id: id });

    // if no user found
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // success response
    return res.status(200).json(currentUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUser = async (req, res) => {

  try {
    const { userId } = getAuth(req)
    const authuser = await clerkClient.users.getUser(userId)
    if (!authuser)
      return res.status(401).json({ message: "unauthorized!!" })

    const users = await user.find({ is_handy: true })
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error)
  }

}

export const searchHandys = async (req, res) => {
  try {
    const { userId } = getAuth(req)
    const authuser = await clerkClient.users.getUser(userId)
    if (!authuser)
      return res.status(401).json({ message: "unauthorized!!" })

    const { name, specialty } = req.query;

    // Build query object
    const query = { is_handy: true };

    // Add search filter - searches BOTH name and specialty fields
    if (name && name.trim() !== '') {
      query.$or = [
        { name: { $regex: name.trim(), $options: 'i' } },
        { specialty: { $regex: name.trim(), $options: 'i' } }
      ];
    }

    // Add specialty filter (exact match from dropdown)
    if (specialty && specialty.trim() !== '' && specialty !== 'all') {
      query.specialty = specialty.trim();
    }

    const users = await user.find(query);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching handys:', error);
    return res.status(500).json({ message: "Error searching handys", error })
  }
}