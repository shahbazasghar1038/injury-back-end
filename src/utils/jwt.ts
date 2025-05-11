import jwt from "jsonwebtoken";

const SECRET: string = process.env.JWT_SECRET || "supersecret";

const generateToken = (payload: object): string => {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

export default { generateToken };
