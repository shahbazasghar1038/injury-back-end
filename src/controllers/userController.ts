import { Request, Response, NextFunction } from "express";
import {
  createUserService,
  getUserByIdService,
  getAllUsersService,
  updateUserService,
  deleteUserService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  updatePasswordService,
  verifyUserService,
} from "../services/userService";

// Create a new user
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userData, addresses } = req.body;
  try {
    const user = await createUserService(userData, addresses);
    res.status(201).json(user);
  } catch (error: any) {
    next(error);
  }
}

export async function verifyUser(req: Request, res: Response): Promise<void> {
  const { email, otp } = req.body;

  try {
<<<<<<< HEAD
    // Call the verifyUserService to verify the user
    const response = await verifyUserService(email, otp);

    // Check the response status returned from the service
    if (response.status === "success") {
      // If the status is success, send the success message
      res.status(200).json({ message: response.message });
    } else {
      // If the status is error, send the error message
      res.status(400).json({ message: response.message });
    }
  } catch (error: any) {
    // Catch any unexpected errors and send a 500 status code
    console.error("Error during user verification:", error.message);
    res
      .status(500)
      .json({ message: "An unexpected error occurred during verification" });
=======
    const isVerified = await verifyUserService(email, otp);
    if (isVerified) {
      res.status(200).json({ message: "User verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error: any) {
    console.error("Error during user verification:", error.message);
    res.status(400).json({ message: error.message });
>>>>>>> 11e5daadda30940b420828caa99f257da770da67
  }
}
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, password } = req.body;
  try {
    const token = await loginService(email, password);
    res.json({ token });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}
// Forgot password: Generate OTP and send it to the user's email
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email } = req.body;

  try {
    const otp = await forgotPasswordService(email);
    res.status(200).json({ message: "OTP sent to email", otp });
  } catch (error: any) {
    next(error);
  }
}

// Reset password: Verify OTP and update the password
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, otp, newPassword } = req.body;

  try {
    const success = await resetPasswordService(email, otp, newPassword);
    if (success) {
      res.status(200).json({ message: "Password updated successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP or email" });
    }
  } catch (error: any) {
    next(error);
  }
}

export async function updatePassword(
  req: Request,
  res: Response
): Promise<void> {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Call the updatePasswordService to validate the current password and update it
    const updated = await updatePasswordService(
      email,
      currentPassword,
      newPassword
    );

    if (updated) {
      res.status(200).json({ message: "Password updated successfully" });
    } else {
      res.status(400).json({ message: "Invalid current password" });
    }
  } catch (error: any) {
    console.error("Error during password update:", error.message);
    res.status(500).json({ message: error.message });
  }
}
// Get a single user by ID
export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.params.id;
    const user = await getUserByIdService(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    next(error);
  }
}

// Get all users
export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (error: any) {
    next(error);
  }
}

// Update a user by ID
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.params.id;
    const { userData, addresses } = req.body;
    const updatedUser = await updateUserService(userId, userData, addresses);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(updatedUser);
  } catch (error: any) {
    next(error);
  }
}

// Delete a user by ID
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.params.id;
    const deleted = await deleteUserService(userId);
    if (!deleted) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    next(error);
  }
}
