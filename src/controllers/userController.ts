import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import Address from "../models/Address";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import EmailService from "../utils/emailService";
import { Sequelize, Op } from "sequelize";

const OTP_EXPIRY_TIME = 10 * 60 * 1000; // OTP expiry time in milliseconds (10 minutes)
const FREE_CASE_LIMIT = 3;

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { userData, addresses } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Create the user in the database
    const user: any = await User.create(userData);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + OTP_EXPIRY_TIME;
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    user.isVerified = false; // Set isVerified to false initially
    await user.save();

    // Create the addresses for the user
    await Promise.all(
      addresses.map((addr: any) => Address.create({ ...addr, userId: user.id }))
    );

    // Send OTP email after user creation
    const subjectLine = "Your OTP for user verification";
    const contentBody = `<p>Your OTP for verifying your account is: <strong>${otp}</strong></p>`;
    await EmailService.send(user.email, { subjectLine, contentBody });

    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error during user creation:", error);
    next(error); // Pass the error to the next middleware
  }
}

export async function getDoctors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const doctors = await User.findAll({
      where: { role: "Doctor" }, // Fetch only users with the "Doctor" role
    });

    if (!doctors.length) {
      return res.status(404).json({ message: "No doctors found" });
    }

    // Send the doctors' data in the response
    res.status(200).json(doctors);
  } catch (error: any) {
    next(error); // Forward error to the error handling middleware
  }
}

export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user: any = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP validity and expiry
    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid OTP or OTP expired" });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.otp = null; // Clear OTP after successful verification
    user.otpExpiresAt = null; // Clear OTP expiry time
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error: any) {
    console.error("Error during user verification:", error);
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ where: { email }, include: [Address] });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const secret = process.env.JWT_SECRET || "mysecret";
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, user });
  } catch (error: any) {
    next(error);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + OTP_EXPIRY_TIME;

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP to the user's email
    const subjectLine = "Your OTP to reset the password";
    const contentBody = `<p>Your OTP for resetting the password is: <strong>${otp}</strong></p>`;
    await EmailService.send(email, { subjectLine, contentBody });

    res.status(200).json({ message: "OTP sent to email", otp });
  } catch (error: any) {
    console.error("Error during forgot password:", error);
    next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { email, otp, newPassword } = req.body;

  try {
    // Find the user by email
    const user: any = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP validity and expiry
    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid OTP or OTP expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null; // Clear OTP after successful reset
    user.otpExpiresAt = null; // Clear OTP expiry time
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Error during password reset:", error);
    next(error);
  }
}

export async function updatePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided current password with the stored hashed password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Error during password update:", error);
    next(error);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, { include: [Address] });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    next(error);
  }
}

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const users = await User.findAll({ include: [Address] });
    res.json(users);
  } catch (error: any) {
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const userId = req.params.id;
    const { userData, addresses } = req.body;

    // Find the user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user with new data
    await user.update(userData);

    // If new addresses are provided, update them
    if (addresses && addresses.length > 0) {
      // Remove old addresses
      await Address.destroy({ where: { userId: user.id } });

      // Add new addresses
      await Promise.all(
        addresses.map((addr: any) =>
          Address.create({ ...addr, userId: user.id })
        )
      );
    }

    // Fetch updated addresses
    const updatedAddresses = await Address.findAll({
      where: { userId: user.id },
    });

    // Send the updated user data along with the updated addresses
    res.json({
      user,
      addresses: updatedAddresses,
    });
  } catch (error: any) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const userId = req.params.id;
    const deletedCount = await User.destroy({ where: { id: userId } });
    if (deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    next(error);
  }
}
