import User from "../models/user.models.js";

const userService = {
  createUser: async ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const hashedPassword = await User.hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    return user;
  },

  // ✅ New function to get all users
  getAllUsers: async () => {
    return await User.find(); // returns all users
  }
};

export default userService;
