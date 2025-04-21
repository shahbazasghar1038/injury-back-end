import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import sequelize from "./src/config/database"; // <-- Import from config
import userRoutes from "./src/routes/userRoutes";
import User from "./src/models/userModel"; // Import User model
import Case from "./src/models/caseModel"; // Import Case model
import caseRoutes from "./src/routes/caseRoutes"; // Import your case routes
import { setupAssociations } from "./src/models/associations";

dotenv.config();

const app = express();

// Enable CORS for all origins or specify your frontend URL
app.use(
  cors({
    origin: "http://localhost:5173", // Corrected by removing the trailing slash
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow methods you want to support
    credentials: true, // Enable credentials if needed (like cookies or authentication headers)
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);

// Setup associations
setupAssociations();

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
