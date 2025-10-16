import projectModel from "../models/project.models.js";
import * as projectService from "../services/project.service.js";

import { validationResult } from "express-validator";
import userModel from "../models/user.models.js";

export const createProject = async (req, res) => {
  console.log(`Creating proiject`);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    console.log(
      `[createProject] Logged In User: ${JSON.stringify(loggedInUser)}`
    );

    const userId = loggedInUser._id;
    const newProject = await projectService.createProject({ name, userId });
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).send(err.message);
  }
};
export const getAllProject = async (req, res) => {
  // 68cbff19538dfdf86e427507 68cbff19538dfdf86e427507
  try {
    // const loggedInUser = async (req, res) => ({
    //     email: req.user.email
    // })
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    console.log(
      `[getAllProject] Logged In User: ${JSON.stringify(loggedInUser)}`
    );
    const allUserProjects = await projectService.getAllProjectByUserId({
      userId: loggedInUser._id,
    });
    return res.status(200).json({
      project: allUserProjects,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const addUserToProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { projectId, users } = req.body;
    console.log(
      `Users Body: ${JSON.stringify(
        req.body,
        null,
        2
      )} | User from req: ${JSON.stringify(req.user, 2, null)}`
    );

    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const fullUsers = await Promise.all(
      users.map(async (id) => {
        const user = await userModel.findById(id);
        return user;
      })
    );

    console.log(`[addUserToProject] Users: ${JSON.stringify(users, null, 2)}`);
    const project = await projectService.addUserToProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });
    return res.status(200).json({
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await projectService.getProjectById({ projectId });
    return res.status(200).json({
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};
