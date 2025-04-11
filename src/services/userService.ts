import User from "../models/userModel";
import Address from "../models/Address";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import crypto from "crypto";
import EmailService from "../utils/emailService";
interface UserData {
  fullName?: string;
  email?: string;
  password?: string; // Password should be hashed before saving
  phone?: string;
  role?: "Doctor" | "Attorney";
}

interface AddressData {
  streetAddress: string;
  state: string;
  zipCode: string;
}

const OTP_EXPIRY_TIME = 10 * 60 * 1000; // OTP expiry time in milliseconds (10 minutes)

export async function forgotPasswordService(email: string): Promise<string> {
  // Step 1: Check if the email exists in the database
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Email not found");
  }

  // Step 2: Generate a random 6-digit OTP (numeric)
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit numeric OTP

  // Step 3: Set OTP and expiration time in the database
  const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
  const otpExpiresAt = Date.now() + OTP_EXPIRY_TIME;

  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save(); // Save OTP and expiry time in the database

  // Step 4: Send OTP to the user's email using BREVO
  const subjectLine = "Your OTP to reset the password";
  const contentBody = `<p>Your OTP for resetting the password is: <strong>${otp}</strong></p>`;

  await EmailService.send(email, { subjectLine, contentBody });

  return otp; // Return OTP for verification (for testing or debugging)
}

export async function resetPasswordService(
  email: string,
  otp: string,
  newPassword: string
): Promise<boolean> {
  // Step 1: Check if the OTP is valid
  const user = await User.findOne({ where: { email } });

  if (!user || !user.otp || !user.otpExpiresAt) {
    throw new Error("OTP not found or expired");
  }

  // Check OTP expiry
  if (user.otpExpiresAt < Date.now()) {
    throw new Error("OTP has expired");
  }

  // Step 2: Compare the provided OTP with the stored OTP
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Step 3: Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Step 4: Update the user's password
  user.password = hashedPassword;
  await user.save();

  // Step 5: Clear OTP and expiration time after successful password reset
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save(); // Save user with cleared OTP fields

  return true; // Password reset successful
}

export async function updatePasswordService(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  // Step 1: Find the user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  // Step 2: Compare the provided current password with the stored hashed password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new Error("Invalid current password");
  }

  // Step 3: Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Step 4: Update the user's password
  user.password = hashedPassword;
  await user.save();

  return true; // Password updated successfully
}

// Create a new user and its addresses within a transaction
export async function createUserService(
  userData: any,
  addresses: AddressData[]
) {
  const transaction = await User.sequelize!.transaction();
  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Set the hashed password to userData
    userData.password = hashedPassword;

    // Create the user
    const user = await User.create(userData, { transaction });

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit numeric OTP
    const otpExpiresAt = Date.now() + OTP_EXPIRY_TIME;

    // Store OTP and expiry time in the database
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    user.isVerified = false; // Set isVerified to false initially
    await user.save();

    // Create addresses for the user
    await Promise.all(
      addresses.map((addr) =>
        Address.create({ ...addr, userId: user.id }, { transaction })
      )
    );

    // Commit the transaction
    await transaction.commit();

    // Step 4: Send OTP to the user's email using BREVO
    const subjectLine = "Your OTP for user verification";
    const contentBody = `<p>Your OTP for verifying your account is: <strong>${otp}</strong></p>`;

    await EmailService.send(user.email, { subjectLine, contentBody });

    return user;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function loginService(
  email: string,
  password: string
): Promise<{ token: string; user: any }> {
  // Find the user by email, including associated addresses
  const user = await User.findOne({
    where: { email },
    include: [Address], // Include user addresses
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare the provided password with the stored hashed password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // Generate a JWT token
  const secret = process.env.JWT_SECRET || "mysecret";
  const token = jwt.sign({ id: user.id, email: user.email }, secret, {
    expiresIn: "1h",
  });

  // Return both the token and the user data (with addresses)
  return { token, user };
}
export async function verifyUserService(
  email: string,
  otp: string
): Promise<boolean> {
  // Step 1: Find the user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  // Step 2: Check if the OTP is valid and not expired
  if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < Date.now()) {
    throw new Error("OTP has expired or invalid");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Step 3: Mark the user as verified
  user.isVerified = true;
  user.otp = null; // Clear OTP after successful verification
  user.otpExpiresAt = null; // Clear OTP expiry time
  await user.save();

  return true; // User is successfully verified
}

// Get a user by its ID (including addresses)
export async function getUserByIdService(id: string) {
  const user = await User.findByPk(id, {
    include: [Address],
  });
  return user;
}

// Get all users (including addresses)
export async function getAllUsersService() {
  const users = await User.findAll({
    include: [Address],
  });
  return users;
}

// Update a user and optionally its addresses within a transaction
export async function updateUserService(
  id: string,
  userData: UserData,
  addresses?: AddressData[]
) {
  const transaction = await User.sequelize!.transaction();
  try {
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return null;
    }
    await user.update(userData, { transaction });
    if (addresses && addresses.length > 0) {
      // Remove old addresses and add the new ones
      await Address.destroy({ where: { userId: user.id }, transaction });
      await Promise.all(
        addresses.map((addr) =>
          Address.create({ ...addr, userId: user.id }, { transaction })
        )
      );
    }
    await transaction.commit();
    return user;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Delete a user by its ID
export async function deleteUserService(id: string) {
  const deletedCount = await User.destroy({ where: { id } });
  return deletedCount;
}
