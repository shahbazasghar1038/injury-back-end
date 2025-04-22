import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import sequelize from "./src/config/database"; // <-- Import from config
import userRoutes from "./src/routes/userRoutes";
import User from "./src/models/userModel"; // Import User model
import Case from "./src/models/caseModel"; // Import Case model
import caseRoutes from "./src/routes/caseRoutes"; // Import your case routes

dotenv.config();

const app = express();

// Enable CORS for all origins or specify your frontend URL
app.use(
  cors({
    origin: "*", // Allows all origins for testing purposes
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);
// Sync models with the database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced!");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
