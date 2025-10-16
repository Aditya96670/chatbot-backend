import mongoose from "mongoose";
import projectModels from "../models/project.models.js";

// Create a new project
export const createProject = async ({ name, userId }) => {
  if (!name) throw new Error("Project name is required");
  if (!userId) throw new Error("User Id is required");

  try {
    const project = await projectModels.create({
      name,
      users: [userId], // user who created the project
    });
    return project;
  } catch (error) {
    if (error.code === 11000) throw new Error("Project name already exists");
    throw error;
  }
};

// Get all projects for a given user
export const getAllProjectByUserId = async ({ userId }) => {
  if (!userId) throw new Error("User Id is required");

  const allUserProjects = await projectModels.find({ users: userId });
  return allUserProjects;
};

// Add users to a project
export const addUserToProject = async ({ projectId, users, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(projectId))
    throw new Error("Invalid ProjectId");

  if (
    !Array.isArray(users) ||
    users.some((u) => !mongoose.Types.ObjectId.isValid(u))
  )
    throw new Error("Invalid userId(s) in users array");

  if (!userId || !mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid userId");

  // Check if the requesting user belongs to this project
  const project = await projectModels.findOne({
    _id: projectId,
    users: userId,  
  });
  if (!project) throw new Error("User does not belong to this project");     

  // Add new users
  const updatedProject = await projectModels.findOneAndUpdate(
    { _id: projectId },
    { $addToSet: { users: { $each: users } } }, 
    { new: true }
  );

  return updatedProject;
};

export const getProjectById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  const project = await projectModels
    .findOne({
      _id: projectId,
    })
    .populate("users");

  return project;
};
