import express from "express";
import dotenv from "dotenv";

import sequelize from "./src/config/database"; // <-- Import from config
import userRoutes from "./src/routes/userRoutes";
import Address from "./src/models/Address"; // Example model

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Sync models with the database
sequelize.sync().then(() => {
  console.log("Database synced");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
