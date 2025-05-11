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
import intakeRoutes from "./src/routes/intakeRoutes";
import { setupAssociations } from "./src/models/associations";
import lienOfferRoutes from "./src/routes/lienOfferRoutes";
import providerTreatmentRecordRoutes from "./src/routes/providerTreatmentRecordRoutes";
import paymentRoutes from "./src/routes/paymentRoutes"; // Import your payment routes
dotenv.config();

const app = express();

// Enable CORS for all origins or specify your frontend URL
const allowedOrigins = [
  "http://localhost:5173", // Local Development URL
  "https://master.d1jucqmuvgmas2.amplifyapp.com", // Your Amplify URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Important to allow cookies and authorization headers
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invite", doctorInvitationRoutes);
app.use("/api/docuseal", docusealRoutes);
app.use("/api/archive", archivedCaseRoutes);
app.use("/api/intakes", intakeRoutes);
app.use("/api/lien-offers", lienOfferRoutes);
app.use("/api/provider-treatment-records", providerTreatmentRecordRoutes);
app.use("/api/payment", paymentRoutes); // Add your payment routes here
app.use("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" }); // Health check endpoint
});
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
