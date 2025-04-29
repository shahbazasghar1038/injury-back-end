import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import sequelize from "./src/config/database"; // <-- Import from config
import userRoutes from "./src/routes/userRoutes";
import User from "./src/models/userModel"; // Import User model
import Case from "./src/models/caseModel"; // Import Case model
import caseRoutes from "./src/routes/caseRoutes"; // Import your case routes
import taskRoutes from "./src/routes/taskRoutes";
import doctorInvitationRoutes from "./src/routes/doctorInvitationRoutes";
import docusealRoutes from "./src/routes/docusealRoutes";
import archivedCaseRoutes from "./src/routes/archivedCaseRoutes";
<<<<<<< HEAD
import intakeRoutes from "./src/routes/intakeRoutes";
=======
>>>>>>> e2e97806a197412924a799aba391e81cd7262c33
import { setupAssociations } from "./src/models/associations";

dotenv.config();

const app = express();

// Enable CORS for all origins or specify your frontend URL
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invite", doctorInvitationRoutes);
app.use("/api/docuseal", docusealRoutes);
app.use("/api/archive", archivedCaseRoutes);
app.use("/api/intakes", intakeRoutes);
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
app.listen(PORT, () => console.log(`Server running on port 5000`));
