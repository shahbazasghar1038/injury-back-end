import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import sequelize from "./src/config/database"; // <-- Import from config
import userRoutes from "./src/routes/userRoutes";
import User from "./src/models/userModel"; // Import User model
import Case from "./src/models/caseModel"; // Import Case model
import caseRoutes from "./src/routes/caseRoutes"; // Import your case routes
<<<<<<< HEAD
=======
import { setupAssociations } from "./src/models/associations";
>>>>>>> 11e5daadda30940b420828caa99f257da770da67

dotenv.config();

const app = express();

// Enable CORS for all origins or specify your frontend URL
app.use(
  cors({
<<<<<<< HEAD
    origin: "*", // Allows all origins for testing purposes
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
=======
    origin: "http://localhost:5173", // Corrected by removing the trailing slash
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow methods you want to support
    credentials: true, // Enable credentials if needed (like cookies or authentication headers)
>>>>>>> 11e5daadda30940b420828caa99f257da770da67
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);
<<<<<<< HEAD
=======

// Setup associations
setupAssociations();

>>>>>>> 11e5daadda30940b420828caa99f257da770da67
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
