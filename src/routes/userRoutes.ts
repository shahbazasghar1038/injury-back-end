import express from "express";
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyUser,
} from "../controllers/userController";

const router = express.Router();

// CREATE user
router.post("/create", createUser);

router.post("/verify-user", verifyUser);
// LOGIN
router.post("/login", login);

// FORGOT PASSWORD
router.post("/forgot-password", forgotPassword);

// RESET PASSWORD (new route)
router.post("/reset-password", resetPassword); // Add reset-password route

router.put("/update-password", updatePassword);

// GET a single user by ID
router.get("/:id", getUserById);

// GET all users
router.get("/", getAllUsers);

// UPDATE user by ID
router.put("/:id", updateUser);

// DELETE user by ID
router.delete("/:id", deleteUser);

export default router;
